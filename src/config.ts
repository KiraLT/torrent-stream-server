import { readFile } from 'fs'
import { promisify } from 'util'

import { merge } from './helpers'

import configSchema from './config.schema.json'
import { validateSchema } from './helpers/validation'

export { configSchema }

/**
 * Project Enviroment variables.
 *
 * Configuration file can overwrite ENV variables.
 */
interface EnvVariables {
    /**
     * Project environment.
     *
     * Default:  `production`
     */
    NODE_ENV: 'development' | 'production'
    /**
     * Server host.
     *
     * Default:  `0.0.0.0`
     */
    HOST: string
    /**
     * Server port.
     *
     * Default:  `env.PORT` or 3000
     */
    PORT: string
    /**
     * Get ip from `X-Forwarded-*` header.
     *
     * Default:  true if inside App Engine or Heroku else false
     */
    TRUST_PROXY: string
    /**
     * Protect API with key. It should be passed to headers to access the API (`authorization`: `bearer ${apiKey}`).
     *
     * If `streamApi` doesn't have a separate key, `apiKey` can be used as JSON Web Token.
     *
     * Default:  undefined
     */
    API_KEY: string
}

/**
 * Configuration file interface, it can overwrite ENV variables.
 */
export interface Config {
    /**
     * Server host.
     *
     * Default:  `0.0.0.0`
     */
    host: string
    /**
     * Server port.
     *
     * Default:  `env.PORT` or 3000
     */
    port: number
    /**
     * Project environment.
     *
     * Default:  `production`
     */
    environment: 'development' | 'production'
    /**
     * Logging configuration.
     *
     * Default:  `console`
     */
    logging: {
        transports: Array<
            | {
                  /**
                   * Log to console
                   */
                  type: 'console'
              }
            | {
                  /**
                   * Enable [loggly](https://www.loggly.com/) logging
                   */
                  type: 'loggly'
                  /**
                   * Loggly subdomain
                   */
                  subdomain: string
                  /**
                   * Loggly token
                   */
                  token: string
                  /**
                   * Loggly tags, can be used to filter logs
                   */
                  tags?: string[]
              }
        >
        /**
         * Logging level.
         *
         * Default:  `info`
         */
        level: 'debug' | 'info' | 'warn' | 'error'
    }
    /**
     * Torrent client settings
     */
    torrents: {
        path: string
        /**
         * Delete torrent data if it is inactive for X seconds.
         *
         * Default:  60 * 60
         */
        ttl: number
        /**
         * Load defaul trackers list & use it for each torrents.
         *
         * Default:  true
         */
        useDefaultTrackers: boolean
        /**
         * Additional trackers (`tr` parameter) which will be appened to each torrent.
         *
         * Default:  []
         */
        announce: string[]
        /**
         * Web Seed (`ws` parameter) which will be appened to each torrent.
         *
         * Default:  []
         */
        urlList: string[]
        /**
         * Peer addresses (`x.pe` parameter).
         *
         * Default:  []
         */
        peerAddresses: string[]
    }
    /**
     * Security settings
     */
    security: {
        /**
         * Stram api (`/stram/:torrent`) settings
         */
        streamApi: {
            /**
             * Protect stream API with [JSON Web Token](https://jwt.io/).
             *
             * If `apiKey` is not set, it can also be used as API key (`authorization`: `bearer ${apiKey}`).
             *
             * Default:  undefined
             */
            key?: string
            /**
             * The maximum allowed age for tokens to still be valid.
             * It is expressed in seconds or a string describing a time span [zeit/ms](https://github.com/vercel/ms)
             *
             * Default:  `6h`
             */
            maxAge: string
        }
        /**
         * Serve frontend static files
         *
         * Default:  environment === 'production'
         */
        frontendEnabled: boolean
        /**
         * Enable API
         *
         * Default:  true
         */
        apiEnabled: boolean
        /**
         * Protect API with key. It should be passed to headers to access the API (`authorization`: `bearer ${apiKey}`).
         *
         * If `streamApi` doesn't have a separate key, `apiKey` can be used as JSON Web Token.
         *
         * Default:  undefined
         */
        apiKey?: string
    }
    /**
     * Get ip from `X-Forwarded-*` header.
     *
     * Default:  true if inside App Engine or Heroku else false
     */
    trustProxy: boolean
}

export function getEnv<T extends keyof EnvVariables>(key: T): EnvVariables[T] | undefined {
    return process.env[key] as any
}

export const isInGoogleAppEngine = process.env.GAE_APPLICATION ? true : false
export const isInHeroku = process.env._ ? process.env._.toLowerCase().includes('heroku') : false

const defaultConfig: Config = {
    host: getEnv('HOST') || '0.0.0.0',
    port: parseInt(getEnv('PORT') || '') || 3000,
    environment: getEnv('NODE_ENV') === 'development' ? 'development' : 'production',
    trustProxy:
        (getEnv('TRUST_PROXY') || '').toLowerCase() === 'true'
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
        apiKey: getEnv('API_KEY') || undefined,
        frontendEnabled: true,
        apiEnabled: true,
    },
}

export async function readConfig(path: string | undefined): Promise<Config> {
    try {
        return validateSchema(
            configSchema,
            path
                ? merge(
                      defaultConfig,
                      JSON.parse(await promisify(readFile)(path, { encoding: 'utf8' }))
                  )
                : defaultConfig,
            {
                name: path || 'config',
            }
        )
    } catch (error) {
        throw Error(`Failed to read config from ${path} - ${error}`)
    }
}
