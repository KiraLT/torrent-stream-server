import express, { Express } from 'express'
import { join } from 'path'
import cors from 'cors'
import { Logger } from 'common-stuff'

import { TorrentClient } from './services/torrent-client'
import { readConfig, Config, frontendBuildPath } from './config'
import { createLogger } from './helpers/logging'
import { getApiRouter } from './api'

import 'express-async-errors'

function createApp(config: Config, logger: Logger): Express {
    logger.info(`Starting app in ${config.environment} environment`)

    const app = express()
    app.use(cors())
    app.use(express.json())

    if (config.trustProxy) {
        logger.info('Enabling proxy support')
        app.set('trust proxy', true)
    }

    return app
}

export async function setup(options?: { configFile: string }): Promise<void> {
    const { configFile } = options || {}
    const config = await readConfig(configFile)
    const logger = createLogger(config)

    const app = createApp(config, logger)
    const client = await TorrentClient.create({
        logger,
        ...config.torrents,
    })

    const globals = {
        config,
        logger,
    }

    app.use(getApiRouter(globals, client))

    if (config.security.frontendEnabled) {
        if (config.environment === 'production') {
            logger.info('Serving frontend files')

            app.use(express.static(frontendBuildPath))
            app.use((_req, res) => {
                res.sendFile(join(frontendBuildPath, 'index.html'))
            })
        }
    }

    app.listen(config.port, config.host, () => {
        logger.info(`Listening on ${config.host}:${config.port}`)

        if (config.environment === 'development') {
            logger.info(`* Website on http://127.0.0.1:${config.port}`)
            logger.info(`* Docs on http://127.0.0.1:${config.port}/api-docs`)
        }
    })
}
