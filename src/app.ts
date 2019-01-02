import express from 'express'
import { TorrentClient } from './torrent'
import { setupStreamApi } from './api/stream'
import { setupTorrentsApi } from './api/torrents';

const port = 3000

function createApp() {
    const app = express()
    app.use(express.json())
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next()
    })
    return app
}

export function setup() {
    const app = createApp()
    const client = new TorrentClient()
    
    app.get('/status', (req, res) => res.send('ok'))

    setupTorrentsApi(app, client)
    setupStreamApi(app, client)

    app.listen(port, () => console.log(`Listening on port ${port}!`))
}
