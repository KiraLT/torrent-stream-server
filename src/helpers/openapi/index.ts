import { Request, Response, NextFunction, Router } from 'express'
import YAML from 'yamljs'
import { resolve } from 'path'
import { flatMap } from 'common-stuff'
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types'
import { stringify } from 'querystring'

import { operations as Operations, paths as Paths } from './generated'

type KeysOfUnion<T> = T extends T ? keyof T : never
type Operation = keyof Operations
type Url = keyof Paths
type Method = KeysOfUnion<Paths[Url]>

export const openapi = YAML.load(resolve(__dirname, '../../../openapi.yaml')) as OpenAPIV3.Document

function getPathByOperation<O extends Operation>(operation: O): { url: Url; method: Method } {
    const value = flatMap(Object.entries(openapi.paths), ([url, data]) => {
        return flatMap(Object.entries(data), ([method, value]) => {
            if (typeof value !== 'string' && 'operationId' in value) {
                if (value.operationId === operation) {
                    return [
                        {
                            url: url as Url,
                            method: method as Method,
                        },
                    ]
                }
            }
            return []
        })
    })[0]

    if (!value) {
        throw new Error(`Operation with id ${operation} not found in openapi configuration`)
    }

    return value
}

export type RouteType<O extends keyof Operations> = [
    Operations[O] extends {
        parameters: {
            path: any
        }
    }
        ? Operations[O]['parameters']['path']
        : undefined,
    Operations[O]['responses'][200]['content'][keyof Operations[O]['responses'][200]['content']],
    undefined,
    Operations[O] extends {
        parameters: {
            query: any
        }
    }
        ? Operations[O]['parameters']['query']
        : undefined
]

export interface Route<O extends keyof Operations = any> {
    url: string
    method: Method
    resolver: (
        req: Request<RouteType<O>[0], RouteType<O>[1], RouteType<O>[2], RouteType<O>[3]>,
        resp: Response<RouteType<O>[1]>,
        next: NextFunction
    ) => unknown
}

export function createRoute<O extends keyof Operations>(
    operation: O,
    resolver: (
        req: Request<RouteType<O>[0], RouteType<O>[1], RouteType<O>[2], RouteType<O>[3]>,
        resp: Response<RouteType<O>[1]>,
        next: NextFunction
    ) => unknown
): Route<O> {
    return {
        ...getPathByOperation(operation),
        resolver,
    }
}

export function createRouter(routes: Route<any>[]): Router {
    return routes.reduce((prev, cur) => {
        const url = cur.url.replace(/{([a-zA-Z]+)}/g, ':$1')

        if (cur.method === 'get') {
            return prev.get(url, cur.resolver)
        }
        if (cur.method === 'post') {
            return prev.post(url, cur.resolver)
        }
        return prev
    }, Router())
}

export function getRouteUrl<O extends keyof Operations>(
    operation: O,
    params: RouteType<O>[0],
    query: RouteType<O>[3]
): string {
    const queryString = Object.keys((query as {}) || {}).length ? `?${stringify(query)}` : ''

    return `${Object.entries((params as any) || {}).reduce((prev, [key, value]) => {
        return prev.replace(`{${key}}`, encodeURIComponent(String(value)))
    }, getPathByOperation(operation).url as string)}${queryString}`
}
