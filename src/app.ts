import express, { Express, Response, Request, NextFunction } from 'express'
import { resolve, join } from 'path'
import { exists } from 'fs'
import cors from 'cors'
import { Logger } from 'winston'

import { TorrentClient } from './torrent'
import { setupStreamApi } from './api/stream'
import { setupTorrentsApi } from './api/torrents'
import { readConfig, Config } from './config'
import { setupAppLogger, createLogger } from './logging'
import { setupUsageApi } from './api/usage'
import { handleApiErrors } from './errors'

import 'express-async-errors'

function createApp(config: Config): Express {
    const app = express()
    app.use(cors())
    app.use(express.json())
    setupAppLogger(app, config)
    
    return app
}

export async function setup(): Promise<void> {
    const config = await readConfig(process.argv[2])
    const logger = createLogger(config)

    logger.info(`Starting app on http://127.0.0.1:${config.port}`)

    const app = createApp(config)
    const client = await TorrentClient.create(config, logger)
    
    app.get('/status', (req, res) => res.send({'status': 'ok'}))

    if (!config.security.streamApi || (config.security.streamApi && config.security.apiKey)) {
        if (config.security.apiKey) {
            app.use('/api/', (req, res, next) => {
                const [type, token] = (req.headers.authorization || '').split(' ')
                if (type.toLowerCase() === 'bearer' && token === config.security.apiKey) {
                    next()
                } else {
                    res.status(403).send({
                        'error': 'Incorect authorization header'
                    })
                }
            })
        }
    
        setupTorrentsApi(app, config, logger, client)
        setupStreamApi(app, config, logger, client)
        setupUsageApi(app, config, logger, client)
    }

    if (config.security.demoEnabled) {
        const path = resolve(__dirname, '../demo/build')

        app.use((req, res, next) => {
            var file = path + req.path;
            exists(file, (fileExists) => {
                if (fileExists) {
                    res.sendFile(file)
                } else {
                    next()
                }
            })
        })

        app.get('/', (req, res) => res.sendFile(join(path, 'index.html')))
        app.get('/play', (req, res) => res.sendFile(join(path, 'index.html')))
        app.get('/dashboard', (req, res) => res.sendFile(join(path, 'index.html')))
    }

    app.use(handleApiErrors(logger))

    app.listen(config.port)
}

