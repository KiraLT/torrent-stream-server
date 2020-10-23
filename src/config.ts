import { readFile } from 'fs'
import { promisify } from 'util'

import { merge } from './utils'

export interface Config {
    host: string
    port: number
    logging: {
        transports: Array<{
            type: 'console'
        } | {
            type: 'loggly'
            subdomain: string
            token: string
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
        demoEnabled: boolean
        apiKey?: string
    }
    trustProxy: boolean
}

// Trust proxy by default if running in GoogleAppEngine
export const isInGoogleAppEngine = process.env.GAE_APPLICATION ? true : false
export const isInHeroku = process.env._ ? process.env._.toLowerCase().includes('heroku') : false

const defaultConfig: Config = {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '') || 3000,
    trustProxy: (process.env.TRUST_PROXY || '').toLowerCase() === 'true' ? true : isInGoogleAppEngine || isInHeroku,
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
        streamApi: undefined,
        apiKey: undefined,
        demoEnabled: true
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
