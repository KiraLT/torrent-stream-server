import { Express } from 'express'
import { Logger } from 'winston'

import { TorrentClient } from '../torrent'
import { Config } from '../config'

export function setupTorrentsApi(app: Express, config: Config, logger: Logger, client: TorrentClient): Express {
    app.get('/torrents', (req, res) => res.send(client.getAll().map(torrent => ({
        infoHash: torrent.infoHash,
        files: torrent.engine.files.map(file => ({
            name: file.name,
            path: file.path,
            length: file.length
        })),
        started: new Date(torrent.started).toISOString(),
        updated: new Date(torrent.updated).toISOString()
    }))))
    return app
}
