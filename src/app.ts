import express from 'express'
import { join } from 'path'
import cors from 'cors'
import { Logger } from 'common-stuff'
import { createHttpTerminator } from 'http-terminator'
import rateLimit from 'express-rate-limit'

import { TorrentClient } from './services/torrent-client'
import { readConfig, Config, frontendBuildPath, Globals } from './config'
import { createLogger, LogsStorage } from './services/logging'
import { getApiRouter } from './api'

import 'express-async-errors'

export interface AppOptions {
    config?: Partial<Config>
    configFile?: string
    logger?: Logger
    client?: TorrentClient
}

export function createApp(options?: AppOptions): Globals {
    const config = readConfig(options?.configFile, options?.config)
    const logStorage = new LogsStorage({
        limit: config.logging.storeLimit
    })
    const logger = options?.logger ? options.logger : createLogger(config, logStorage)

    const client =
        options?.client ??
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
                logStorage,
                app,
                client
            }
        )
    )

    if (config.security.frontendEnabled) {
        app.use(express.static(frontendBuildPath))
        app.use((_req, res) => {
            res.sendFile(join(frontendBuildPath, 'index.html'))
        })
    }

    return { app, client, logger, config, logStorage }
}

export function createAndRunApp(options?: AppOptions): Globals {
    const { app, config, logger, client, logStorage } = createApp(options)

    const server = app.listen(config.port, config.host, () => {
        const accessHost = config.host === '0.0.0.0' ? '127.0.0.1' : config.host

        logger.info(
            [
                `Running ${config.environment} server on ${config.host}:${config.port}`,
                ...(config.environment === 'development' ? [
                    `* Website on http://${accessHost}:${config.port}`,
                    `* Docs on http://${accessHost}:${config.port}/api-docs`
                ] : [])
            ].join('\n')
        )
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

    return { app, config, logger, client, logStorage }
}
