import { Express } from 'express'
import { Logger } from 'winston'
import { NotFound } from 'http-errors'

import { Config } from '../config'
import { Torrent } from '../models'
import { validateString } from '../helpers/validation'
import { TorrentClient, TorrentClientTorrent } from '../services/torrent-client'
import { signJwtToken } from '../helpers'

function getSteamUrl(torrent: string, file: string, encodeToken?: string): string {
    if (encodeToken) {
        return `/stream/${encodeURIComponent(
            signJwtToken(
                {
                    torrent,
                    file,
                },
                encodeToken
            )
        )}`
    }

    return `/stream/${encodeURIComponent(torrent)}?file=${encodeURIComponent(file)}`
}

function torrentToJson(v: TorrentClientTorrent, encodeToken?: string): Torrent {
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
            stream: getSteamUrl(v.link, f.path, encodeToken),
        })),
    }
}

export function setupTorrentsApi(
    app: Express,
    config: Config,
    _logger: Logger,
    client: TorrentClient
): Express {
    const encodeToken = config.security.streamApi.key || config.security.apiKey

    app.post<{}, Torrent, {}, { torrent: unknown }>('/api/torrents', async (req, res) => {
        const link = validateString(req.query.torrent, 'torrent')
        const torrent = await client.addTorrent(link)

        res.json(torrentToJson(torrent, encodeToken))
    })

    app.get<{}, Torrent[], {}, {}>('/api/torrents', (_req, res) => {
        return res.json(client.getTorrents().map((v) => torrentToJson(v, encodeToken)))
    })

    app.get<{ id: string }, Torrent, {}, {}>('/api/torrents/:id', (req, res) => {
        const torrent = client.getTorrent(validateString(req.params.id, 'id'))

        if (torrent) {
            return res.json(torrentToJson(torrent, encodeToken))
        }

        throw new NotFound()
    })

    return app
}
