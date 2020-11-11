import express, { Express } from 'express'
import { resolve, join } from 'path'
import cors from 'cors'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import { Unauthorized, Forbidden, NotFound } from 'http-errors'

import { TorrentClient } from './services/torrent-client'
import { readConfig, Config, frontendBuildPath } from './config'
import { createLogger } from './helpers/logging'
import { handleApiErrors } from './helpers/errors'
import {
    getAuthRouter,
    getBrowseRouter,
    getUsageRouter,
    getStreamRouter,
    getTorrentsRouter,
} from './api'

import 'express-async-errors'
import { Logger } from 'winston'

function createApp(config: Config, logger: Logger): Express {
    logger.info(`Starting app in ${config.environment} environment`)

    const app = express()
    app.use(cors())
    app.use(express.json())

    if (config.environment === 'development') {
        const swaggerDocument = YAML.load(resolve(__dirname, '../swagger.yaml'))
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    }

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

    app.get('/status', (_req, res) => res.send({ status: 'ok' }))

    if (config.security.apiEnabled) {
        if (config.security.apiKey || config.security.streamApi.key) {
            logger.info('Enabled API security')

            app.use('/api/', (req, _res, next) => {
                const [type, token] = (req.headers.authorization || '').split(' ')
                const correctKey = config.security.apiKey || config.security.streamApi.key

                if (type === '') {
                    throw new Unauthorized()
                }

                if (type.toLowerCase() === 'bearer' && correctKey && token === correctKey) {
                    next()
                } else {
                    throw new Forbidden()
                }
            })
        }

        app.use(
            '/api',
            getAuthRouter(config, logger),
            getBrowseRouter(config, logger),
            getUsageRouter(config, logger),
            getTorrentsRouter(config, logger, client)
        )
        app.use('/', getStreamRouter(config, logger, client))

        app.use('/api/?*', () => {
            throw new NotFound()
        })
    } else {
        logger.info('API is disabled according to the config')
    }

    app.use(handleApiErrors(logger))

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
