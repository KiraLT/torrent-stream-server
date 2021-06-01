import pump from 'pump'
import rangeParser from 'range-parser'
import { HttpError, HttpStatusCodes } from 'common-stuff'

import { TorrentClient, filterFiles } from '../services/torrent-client'
import { Globals } from '../config'
import { verifyJwtToken, getSteamUrl } from '../helpers'
import { createRoute, Route, getRouteUrl } from '../helpers/openapi'

export function getStreamRouter({ config }: Globals, client: TorrentClient): Route[] {
    const encodeToken = config.security.streamApi.key || config.security.apiKey

    type Params = { torrent: string; file?: string; fileType?: string; fileIndex?: number }
    const parseParams = (params: Params): Params => {
        if (encodeToken) {
            if (params.file || params.fileIndex || params.fileType) {
                throw new HttpError(
                    HttpStatusCodes.BAD_REQUEST,
                    `All parameters should be encoded with JWT`
                )
            }

            const data = verifyJwtToken<Params>(
                params.torrent,
                encodeToken,
                config.security.streamApi.maxAge
            )

            if (!data) {
                throw new HttpError(HttpStatusCodes.FORBIDDEN, 'Incorrect JWT encoding')
            }

            return data
        }

        return params
    }

    return [
        createRoute('getStream', async (req, res) => {
            const { torrent: link, ...params } = parseParams({
                torrent: req.params.torrent,
                ...req.query,
            })

            const torrent = await client.addTorrent(link)

            const file = filterFiles(torrent.files, params)[0]

            if (!file) {
                throw new HttpError(HttpStatusCodes.NOT_FOUND)
            }

            res.setHeader('Accept-Ranges', 'bytes')
            res.attachment(file.name)
            req.connection.setTimeout(3600000)

            const parsedRange = req.headers.range
                ? rangeParser(file.length, req.headers.range)
                : undefined
            const range = parsedRange instanceof Array ? parsedRange[0] : undefined

            if (range) {
                res.statusCode = 206
                res.setHeader('Content-Length', range.end - range.start + 1)
                res.setHeader(
                    'Content-Range',
                    'bytes ' + range.start + '-' + range.end + '/' + file.length
                )
            } else {
                res.setHeader('Content-Length', file.length)
            }

            if (req.method === 'HEAD') {
                return res.end()
            }

            return pump(file.createReadStream(range), res, () => {
                file.stop()
            })
        }),
        createRoute('getStream2', async (req, res) => {
            const { torrent, ...query } = req.query

            return res.redirect(getRouteUrl('getStream', { torrent }, query), 301)
        }),
        createRoute('getPlaylist', async (req, res) => {
            const domain = req.protocol + '://' + req.get('host')
            const { torrent: link, ...params } = parseParams({
                torrent: req.params.torrent,
                ...req.query,
            })

            const torrent = await client.addTorrent(link)
            const files = filterFiles(torrent.files, params).filter(
                (v) => v.type.includes('video') || v.type.includes('audio')
            )

            req.connection.setTimeout(10000)

            res.attachment(torrent.name + `.m3u`)

            return res.send(
                [
                    '#EXTM3U',
                    ...files.flatMap((f) => [
                        `#EXTINF:-1,${f.name}`,
                        `${domain}${getSteamUrl(link, f.path, encodeToken)}`,
                    ]),
                ].join('\n')
            )
        }),
        createRoute('getPlaylist2', async (req, res) => {
            const { torrent, ...query } = req.query

            return res.redirect(getRouteUrl('getPlaylist', { torrent }, query), 301)
        }),
    ]
}
