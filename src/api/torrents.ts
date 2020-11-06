import { Express } from 'express'
import { Logger } from 'winston'
import { NotFound } from 'http-errors'

import { Config } from '../config'
import { Torrent } from '../models'
import { getSteamUrl } from '../helpers'
import { validateString } from '../helpers/validation'
import { TorrentClient, TorrentClientTorrent } from '../services/torrent-client'

function torrentToJson(v: TorrentClientTorrent): Torrent {
    return {
        name: v.name,
        infoHash: v.infoHash,
        downloadSpeed: v.getDownloadSpeed(),
        downloaded: v.getDownloaded(),
        link: v.link,
        started: v.created.getTime(),
        updated: v.updated.getTime(),
        files: v.files.map((f) => ({
            name: f.name,
            path: f.path,
            type: f.type,
            length: f.length,
            stream: getSteamUrl(v.link, f.path),
        })),
    }
}

export function setupTorrentsApi(
    app: Express,
    _config: Config,
    _logger: Logger,
    client: TorrentClient
): Express {
    app.post<{}, Torrent, {}, { torrent: unknown }>('/api/torrents', async (req, res) => {
        const link = validateString(req.query.torrent, 'torrent')
        const torrent = await client.addTorrent(link)

        res.json(torrentToJson(torrent))
    })

    app.get<{}, Torrent[], {}, {}>('/api/torrents', (_req, res) => {
        return res.json(client.getTorrents().map(torrentToJson))
    })

    app.get<{ id: string }, Torrent, {}, {}>('/api/torrents/:id', (req, res) => {
        const torrent = client.getTorrent(validateString(req.params.id, 'id'))

        if (torrent) {
            return res.json(torrentToJson(torrent))
        }

        throw new NotFound()
    })

    return app
}
