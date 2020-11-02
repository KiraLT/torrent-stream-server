import { Express } from 'express'
import { Logger } from 'winston'
import { NotFound } from 'http-errors'

import { TorrentClient } from '../torrent'
import { Config } from '../config'
import { Torrent } from '../models'
import { validateString } from '../helpers'

export function setupTorrentsApi(app: Express, _config: Config, _logger: Logger, client: TorrentClient): Express {
    app.post<{}, Torrent, {}, {torrent: unknown}>('/api/torrents', async (req, res) => {
        const link = validateString(req.query.torrent, 'torrent') 
        const torrent = await client.addAndGet(link)
    
        res.json(torrent.getMeta())
    })

    app.get<{}, Torrent[], {}, {}>('/api/torrents', (_req, res) => {
        return res.json(client.getAll().map(v => v.getMeta()))
    })

    app.get<{id: string}, Torrent, {}, {}>('/api/torrents/:id', (req, res) => {
        const torrent = client.get(validateString(req.params.id, 'id'))
    
        if (torrent) {
            return res.json(torrent.getMeta())
        }
    
        throw new NotFound()
        
    })

    return app
}
