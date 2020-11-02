import express, { Express } from 'express'
import { resolve, join } from 'path'
import { exists } from 'fs'
import cors from 'cors'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import { Unauthorized, Forbidden } from 'http-errors'

import { TorrentClient } from './torrent'
import { setupStreamApi } from './api/stream'
import { setupTorrentsApi } from './api/torrents'
import { readConfig, Config } from './config'
import { createLogger } from './logging'
import { setupUsageApi } from './api/usage'
import { handleApiErrors } from './errors'
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
        const swaggerDocument = YAML.load(resolve(__dirname, 'swagger.yaml'))
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    }

    if (config.trustProxy) {
        logger.info('Enabling proxy support')
        app.set('trust proxy', true)
    }

    return app
}

export async function setup(): Promise<void> {
    const config = await readConfig(process.argv[2])
    const logger = createLogger(config)

    const app = createApp(config, logger)
    const client = await TorrentClient.create(config, logger)

    app.get('/status', (_req, res) => res.send({ status: 'ok' }))

    if (config.security.apiEnabled) {
        if (config.security.apiKey || config.security.streamApi) {
            logger.info('Enabled API security')

            app.use('/api/', (req, _res, next) => {
                const [type, token] = (req.headers.authorization || '').split(' ')
                const correctKey =
                    config.security.apiKey ||
                    (config.security.streamApi && config.security.streamApi.key)

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
        setupUsageApi(app, config, logger, client)
        setupBrowseApi(app, config, logger, client)
        setupAuthApi(app, config, logger, client)
    } else {
        logger.info('API is disabled according to the config')
    }

    if (config.security.frontendEnabled) {
        if (config.environment === 'production') {
            logger.info('Serving frontend files')

            const path = resolve(__dirname, '../frontend/build')

            app.use((req, res, next) => {
                var file = path + req.path
                exists(file, (fileExists) => {
                    if (fileExists) {
                        res.sendFile(file)
                    } else {
                        next()
                    }
                })
            })
            app.get('/', (_req, res) => res.sendFile(join(path, 'index.html')))
            app.get('/play', (_req, res) => res.sendFile(join(path, 'index.html')))
            app.get('/dashboard', (_req, res) => res.sendFile(join(path, 'index.html')))
            app.get('/browse', (_req, res) => res.sendFile(join(path, 'browse.html')))
        }
    }

    app.use(handleApiErrors(logger))

    app.listen(config.port, config.host, () => {
        logger.info(`Listening on ${config.host}:${config.port}`)

        if (config.environment === 'development') {
            logger.info(`* Website on http://127.0.0.1:${config.port}`)
            logger.info(`* Docs on http://127.0.0.1:${config.port}/api-docs`)
        }
    })
}
