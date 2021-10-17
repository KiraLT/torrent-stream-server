import { HttpError, HttpStatusCodes } from 'common-stuff'

import { Globals } from '../config'
import { TorrentClientTorrent } from '../services/torrent-client'
import { getSteamUrl, getPlaylistUrl } from '../helpers'
import { Route, createRoute } from '../services/openapi'

const torrentToJson = (
    v: TorrentClientTorrent,
    domain: string,
    encodeToken?: string
) => {
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
            streamZip: `${domain}${getSteamUrl(
                v.link,
                f.path,
                encodeToken,
                'zip'
            )}`,
        })),
        playlist: `${domain}${getPlaylistUrl(v.link, encodeToken)}`,
        streamZip: `${domain}${getSteamUrl(
            v.link,
            undefined,
            encodeToken,
            'zip'
        )}`,
    }
}

export function getTorrentsRouter(
    { config, client }: Globals,
): Route[] {
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

            return res.json(
                client
                    .getTorrents()
                    .map((v) => torrentToJson(v, domain, encodeToken))
            )
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
