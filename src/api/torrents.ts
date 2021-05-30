import { HttpError, HttpStatusCodes } from 'common-stuff'

import { Globals } from '../config'
import { TorrentClient, TorrentClientTorrent } from '../services/torrent-client'
import { getSteamUrl, getPlaylistUrl } from '../helpers'
import { Route, createRoute } from '../helpers/openapi'

const torrentToJson = (v: TorrentClientTorrent, domain: string, encodeToken?: string) => {
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

export function getTorrentsRouter({ config }: Globals, client: TorrentClient): Route[] {
    const encodeToken = config.security.streamApi.key || config.security.apiKey

    return [
        createRoute('createTorrent', async (req, res) => {
            const { torrent: link } = req.query

            const domain = req.protocol + '://' + req.get('host')
            const torrent = await client.addTorrent(link)

            return res.json(torrentToJson(torrent, domain, encodeToken))
        }),
        createRoute('getTorrents', (req, res) => {
            const domain = req.protocol + '://' + req.get('host')

            return res.json(client.getTorrents().map((v) => torrentToJson(v, domain, encodeToken)))
        }),
        createRoute('getTorrent', (req, res) => {
            const { infoHash } = req.params
            const domain = req.protocol + '://' + req.get('host')
            const torrent = client.getTorrent(infoHash)

            if (torrent) {
                return res.json(torrentToJson(torrent, domain, encodeToken))
            }

            throw new HttpError(HttpStatusCodes.NOT_FOUND)
        }),
    ]
}
