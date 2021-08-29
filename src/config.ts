import { readFile } from 'fs'
import { promisify } from 'util'
import { resolve } from 'path'
import { Logger, merge, convertToNested, camelCase } from 'common-stuff'
import { z } from 'zod'

export enum Environment {
    Production = 'production',
    Development = 'development',
}

const configSchema = z.object({
    /**
     * Server host.
     *
     * Default: `0.0.0.0`
     */
    host: z.string(),
    /**
     * Server port.
     *
     * Default: `env.PORT` or 3000
     */
    port: z.number(),
    /**
     * Project environment.
     *
     * Default: `production`
     */
    environment: z.nativeEnum(Environment),
    /**
     * Logging configuration.
     *
     * Default: `console`
     */
    logging: z.object({
        transports: z.array(
            z.union([
                z.object({
                    type: z.literal('console'),
                }),
                z.object({
                    type: z.literal('loggly'),
                    subdomain: z.string(),
                    token: z.string(),
                    tags: z.array(z.string()).optional(),
                }),
            ])
        ),
        /**
         * Logging level.
         *
         * Default: `info`
         */
        level: z.enum(['debug', 'info', 'warn', 'error']),
    }),
    /**
     * Torrent client settings
     */
    torrents: z.object({
        path: z.string(),
        /**
         * Delete torrent data if it is inactive for X seconds.
         *
         * Default: `3600`
         */
        ttl: z.number(),
        /**
         * Load default trackers list & use it for each torrents.
         *
         * Default: `true`
         */
        useDefaultTrackers: z.boolean(),
        /**
         * Additional trackers (`tr` parameter) which will be appended to each torrent.
         *
         * Default: `[]`
         */
        announce: z.array(z.string()),
        /**
         * Web Seed (`ws` parameter) which will be appended to each torrent.
         *
         * Default: `[]`
         */
        urlList: z.array(z.string()),
        /**
         * Peer addresses (`x.pe` parameter).
         *
         * Default: `[]`
         */
        peerAddresses: z.array(z.string()),
        /**
         * Max download speed (bytes/sec) over all torrents
         * 
         * Default: `5242880`
         */
        downloadLimit: z.number(),
        /**
         * Max upload speed (bytes/sec) over all torrents
         * 
         * Default: `0`
         */
        uploadLimit: z.number(),
    }),
    /**
     * Security settings
     */
    security: z.object({
        /**
         * Stream API (`/stream/:torrent`) settings
         */
        streamApi: z.object({
            /**
             * Protect stream API with [JSON Web Token](https://jwt.io/).
             *
             * If `apiKey` is not set, it can also be used as API key (`authorization`: `bearer ${apiKey}`).
             *
             * Default: `undefined`
             */
            key: z.string().optional(),
            /**
             * The maximum allowed age for tokens to still be valid.
             * It is expressed in seconds or a string describing a time span [zeit/ms](https://github.com/vercel/ms)
             *
             * Default: `6h`
             */
            maxAge: z.string(),
        }),
        /**
         * Serve frontend static files
         *
         * Default: environment === 'production'
         */
        frontendEnabled: z.boolean(),
        /**
         * Enable API
         *
         * Default: true
         */
        apiEnabled: z.boolean(),
        /**
         * Protect API with key. It should be passed to headers to access the API (`authorization`: `bearer ${apiKey}`).
         *
         * If `streamApi` doesn't have a separate key, `apiKey` can be used as JSON Web Token.
         *
         * Default: undefined
         */
        apiKey: z.string().optional(),
        /**
         * Limit requests per minute for single IP
         * 
         * Default: 100
         */
        rpm: z.number()
    }),
    /**
     * Get ip from `X-Forwarded-*` header.
     *
     * Default: true if inside App Engine or Heroku else false
     */
    trustProxy: z.boolean(),
})

export type Config = z.infer<typeof configSchema>

export const isInGoogleAppEngine = process.env.GAE_APPLICATION ? true : false
export const isInHeroku = process.env._ ? process.env._.toLowerCase().includes('heroku') : false

const parsedEnv = convertToNested(process.env, {
    separator: '__',
    transformKey: camelCase,
})

const defaultConfig: Config = {
    host: (parsedEnv.host as any) || '0.0.0.0',
    port: (parsedEnv.port as any) || 3000,
    environment:
        parsedEnv.nodeEnv === Environment.Development
            ? Environment.Development
            : Environment.Production,
    trustProxy: !!parsedEnv.trustProxy || isInGoogleAppEngine || isInHeroku,
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
        uploadLimit: 0,
        downloadLimit: 5242880
    },
    security: {
        streamApi: {
            maxAge: '6h',
        },
        apiKey: (parsedEnv.apiKey as any) || undefined,
        frontendEnabled: true,
        apiEnabled: true,
        rpm: 100
    },
}

export async function readConfig(path: string | undefined): Promise<Config> {
    try {
        return configSchema.parse(
            merge(
                merge(
                    defaultConfig,
                    path ? JSON.parse(await promisify(readFile)(path, { encoding: 'utf8' })) : {}
                ),
                parsedEnv.config || {}
            )
        )
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errors = err.errors.map((v) => `${v.message} @ ${v.path.join('.')}`)
            throw Error(`Configuration error: ${errors.join(', ')}`)
        }
        throw Error(`Configuration error: ${err}`)
    }
}

/**
 * Frontend package path to build directory
 */
export const frontendBuildPath = resolve(__dirname, '../frontend/build')

export interface Globals {
    config: Config
    logger: Logger
}
