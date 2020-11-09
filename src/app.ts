import express, { Express } from 'express'
import { resolve, join } from 'path'
import { exists } from 'fs'
import cors from 'cors'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import { Unauthorized, Forbidden, NotFound } from 'http-errors'

import { TorrentClient } from './services/torrent-client'
import { setupStreamApi } from './api/stream'
import { setupTorrentsApi } from './api/torrents'
import { readConfig, Config } from './config'
import { createLogger } from './helpers/logging'
import { setupUsageApi } from './api/usage'
import { handleApiErrors } from './helpers/errors'
import { setupBrowseApi } from './api/browse'
import { setupAuthApi } from './api/auth'

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

        setupTorrentsApi(app, config, logger, client)
        setupStreamApi(app, config, logger, client)
        setupUsageApi(app, config, logger)
        setupBrowseApi(app, config, logger)
        setupAuthApi(app, config, logger)

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

            const path = resolve(__dirname, '../frontend/build')

            app.use((req, res) => {
                var file = path + req.path
                exists(file, (fileExists) => {
                    if (fileExists) {
                        res.sendFile(file)
                    } else {
                        res.sendFile(join(path, 'index.html'))
                    }
                })
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
