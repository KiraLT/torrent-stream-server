import { Router } from 'express'
import { Logger } from 'winston'
import { NotFound } from 'http-errors'

import { Config } from '../config'
import { TorrentModel } from '../models'
import { validateString } from '../helpers/validation'
import { TorrentClient, TorrentClientTorrent } from '../services/torrent-client'
import { getSteamUrl, getPlaylistUrl } from '../helpers'

function torrentToJson(
    v: TorrentClientTorrent,
    domain: string,
    encodeToken?: string
): TorrentModel {
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
            stream: `${domain}${getSteamUrl(v.link, f.path, encodeToken)}`,
        })),
        playlist: `${domain}${getPlaylistUrl(v.link, encodeToken)}`,
    }
}

export function getTorrentsRouter(config: Config, _logger: Logger, client: TorrentClient): Router {
    const encodeToken = config.security.streamApi.key || config.security.apiKey

    return Router()
        .post<{}, TorrentModel, {}, { torrent: unknown }>('/torrents', async (req, res) => {
            const domain = req.protocol + '://' + req.get('host')
            const link = validateString(req.query.torrent, 'torrent')
            const torrent = await client.addTorrent(link)

            res.json(torrentToJson(torrent, domain, encodeToken))
        })
        .get<{}, TorrentModel[], {}, {}>('/torrents', (req, res) => {
            const domain = req.protocol + '://' + req.get('host')

            return res.json(client.getTorrents().map((v) => torrentToJson(v, domain, encodeToken)))
        })
        .get<{ id: string }, TorrentModel, {}, {}>('/torrents/:id', (req, res) => {
            const domain = req.protocol + '://' + req.get('host')
            const torrent = client.getTorrent(validateString(req.params.id, 'id'))

            if (torrent) {
                return res.json(torrentToJson(torrent, domain, encodeToken))
            }

            throw new NotFound()
        })
}
