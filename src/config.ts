import { readFile } from 'fs'
import { promisify } from 'util'

import { merge } from './utils'

export interface Config {
    port: number
    logging: {
        transports: Array<{
            type: 'console'
        } | {
            type: 'loggly'
            subdomain: string
            token: true
            tags?: string[]
        }>
        level: 'debug' | 'info' | 'warn' | 'error'
    }
    torrents: {
        path: string
        autocleanInternal: number
    }
    security: {
        streamApi?: {
            key: string
            maxAge: string
        }
    }
}

const defaultConfig: Config = {
    port: 3000,
    logging: {
        transports: [
            {
                type: 'console'
            }
        ],
        level: 'info'
    },
    torrents: {
        path: '/tmp/torrent-stream-server',
        autocleanInternal: 60*60
    },
    security: {
        streamApi: undefined
    }
}

export async function readConfig(path: string | undefined): Promise<Config> {
    try {
        return path ? mergeConfig(JSON.parse(await promisify(readFile)(path, { encoding: 'utf8' }))) : defaultConfig
    } catch (error) {
        throw Error(`Failed to read config from ${path} - ${error}`)
    }
}

function mergeConfig(config: {}): Config {
    return merge(defaultConfig, config)
}
