import { Configuration } from './helpers/client'

export const apiDomain =
    process.env.NODE_ENV === 'production'
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://127.0.0.1:3000'

export function getApiConfig(options?: { bearer?: string }): Configuration {
    const { bearer } = options || {}

    return new Configuration({
        basePath: apiDomain,
        accessToken: bearer,
    })
}

export interface State {
    bearerRequired?: boolean
    bearer?: string
}

export const defaultState = {}
