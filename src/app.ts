import express, { Express } from 'express'
import { join } from 'path'
import cors from 'cors'
import { Logger } from 'common-stuff'
import { createHttpTerminator } from 'http-terminator'
import rateLimit from 'express-rate-limit'

import { TorrentClient } from './services/torrent-client'
import { readConfig, Config, frontendBuildPath } from './config'
import { createLogger } from './helpers/logging'
import { getApiRouter } from './api'

import 'express-async-errors'

export interface AppOptions {
    config?: Partial<Config>
    configFile?: string
    logger?: Logger
    client?: TorrentClient
}

export interface AppGlobals {
    app: Express
    client: TorrentClient
    logger: Logger
    config: Config
}

export function createApp(options: AppOptions): AppGlobals {
    const config = readConfig(options.configFile, options.config)
    const logger = options.logger ?? createLogger(config)

    const client =
        options.client ??
        new TorrentClient({
            logger,
            ...config.torrents,
        })

    const app = express()
    app.use(cors())
    app.use(express.json())

    if (config.trustProxy) {
        app.set('trust proxy', true)
    }

    app.use(
        rateLimit({
            windowMs: 60 * 1000,
            max: config.security.rpm,
        })
    )

    app.use(
        getApiRouter(
            {
                config,
                logger,
            },
            client
        )
    )

    if (config.security.frontendEnabled) {
        app.use(express.static(frontendBuildPath))
        app.use((_req, res) => {
            res.sendFile(join(frontendBuildPath, 'index.html'))
        })
    }

    return { app, client, logger, config }
}

export function createAndRunApp(options: AppOptions): AppGlobals {
    const { app, config, logger, client } = createApp(options)

    const server = app.listen(config.port, config.host, () => {
        logger.info(
            `Running ${config.environment} server on ${config.host}:${config.port}`
        )

        if (config.environment === 'development') {
            const accessHost =
                config.host === '0.0.0.0' ? '127.0.0.1' : config.host

            logger.info(`* Website on http://${accessHost}:${config.port}`)
            logger.info(
                `* Docs on http://${accessHost}:${config.port}/api-docs`
            )
        }
    })

    const httpTerminator = createHttpTerminator({
        server,
    })

    const shutdown = async (signal: NodeJS.Signals) => {
        logger.info(`${signal} signal received, closing server`)

        try {
            await httpTerminator.terminate()
        } catch (err) {
            logger.warn(`Error while terminating HTTP server: ${err}`)
        }

        try {
            await client.destroy()
        } catch (err) {
            logger.warn(`Error while terminating torrents client: ${err}`)
        }

        process.exit()
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    return { app, config, logger, client }
}
