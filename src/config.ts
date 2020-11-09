import { readFile } from 'fs'
import { promisify } from 'util'

import { merge } from './helpers'

export interface Config {
    host: string
    port: number
    environment: 'development' | 'production'
    logging: {
        transports: Array<
            | {
                  type: 'console'
              }
            | {
                  type: 'loggly'
                  subdomain: string
                  token: string
                  tags?: string[]
              }
        >
        level: 'debug' | 'info' | 'warn' | 'error'
    }
    torrents: {
        path: string
        /**
         * Delete torrent data if it is inactive for X seconds
         */
        ttl: number
        /**
         * Load defaul trackers list & use it for each torrents
         */
        useDefaultTrackers: boolean
        /**
         * Additional trackers (`tr` parameter) which will be appened to each torrent
         */
        announce: string[]
        /**
         * Web Seed (`ws` parameter) which will be appened to each torrent
         */
        urlList: string[]
        /**
         * Peer addresses (`x.pe` parameter)
         */
        peerAddresses: string[]
    }
    security: {
        streamApi: {
            key?: string
            maxAge: string
        }
        frontendEnabled: boolean
        apiEnabled: boolean
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
    environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    trustProxy:
        (process.env.TRUST_PROXY || '').toLowerCase() === 'true'
            ? true
            : isInGoogleAppEngine || isInHeroku,
    logging: {
        transports: [
            {
                type: 'console',
            },
        ],
        level: 'info',
    },
    torrents: {
        path: '/tmp/torrent-stream-server',
        ttl: 60 * 60,
        useDefaultTrackers: true,
        announce: [],
        urlList: [],
        peerAddresses: [],
    },
    security: {
        streamApi: {
            maxAge: '6h',
        },
        apiKey: undefined,
        frontendEnabled: true,
        apiEnabled: true,
    },
}

export async function readConfig(path: string | undefined): Promise<Config> {
    try {
        return path
            ? merge(
                  defaultConfig,
                  JSON.parse(await promisify(readFile)(path, { encoding: 'utf8' }))
              )
            : defaultConfig
    } catch (error) {
        throw Error(`Failed to read config from ${path} - ${error}`)
    }
}
