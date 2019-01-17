import { Express, default as express } from 'express'
import winston from 'winston'
import expressWinston from 'express-winston'
const { Loggly } = require('winston-loggly-bulk')

import { TorrentClient } from './torrent'
import { setupStreamApi } from './api/stream'
import { setupTorrentsApi } from './api/torrents'
import { readConfig, Config } from './config'

function createApp(config: Config): Express {
    const app = express()
    app.use(express.json())
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next()
    })
    return setupLogging(app, config)
}

function setupLogging(app: Express, config: Config): Express {
    if (config.logging && config.logging.transports) {
        app.use(expressWinston.logger({
            transports: config.logging.transports.map(
                v => v.type === 'loggly' ? new Loggly({
                    subdomain: v.subdomain,
                    inputToken: v.token,
                    json: true,
                    tags: v.tags || []
                }) : new winston.transports.Console({}))
        }))
    }
    return app
}

export async function setup(): Promise<void> {
    const config = await readConfig(process.argv[2])
    const app = createApp(config)
    const client = new TorrentClient()
    
    app.get('/status', (req, res) => res.send('ok'))

    setupTorrentsApi(app, client)
    setupStreamApi(app, client)

    app.listen(config.port, () => console.log(`Listening on port ${config.port}!`))
}
