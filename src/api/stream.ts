import pump from 'pump'
import rangeParser from 'range-parser'
import { Router } from 'express'
import { Logger } from 'winston'
import { Forbidden, NotFound, BadRequest } from 'http-errors'
import { stringify } from 'querystring'

import { TorrentClient, filterFiles } from '../services/torrent-client'
import { Config } from '../config'
import { verifyJwtToken, getSteamUrl } from '../helpers'
import { validateString, validateInt } from '../helpers/validation'

export function getStreamRouter(config: Config, _logger: Logger, client: TorrentClient): Router {
    const encodeToken = config.security.streamApi.key || config.security.apiKey

    const parseParams = (
        params: Record<string, unknown>
    ): { torrent: string; file?: string; fileType?: string; fileIndex?: number } => {
        if (encodeToken) {
            if (params.file || params.fileIndex || params.fileType) {
                throw new BadRequest(`All parameters should be encoded with JWT`)
            }

            const data = verifyJwtToken<any>(
                validateString(params.token || params.torrent, 'torrent'),
                encodeToken,
                config.security.streamApi.maxAge
            )

            if (!data) {
                throw new Forbidden('Incorrect JWT encoding')
            }

            return data
        }

        return {
            torrent: validateString(params.torrent, 'torrent'),
            file: params.file ? validateString(params.file, 'file') : undefined,
            fileType: params.fileType ? validateString(params.fileType, 'fileType') : undefined,
            fileIndex: params.fileIndex ? validateInt(params.fileIndex, 'fileIndex') : undefined,
        }
    }

    return Router()
        .get<{ torrent: string }, {}, {}, Record<'file' | 'fileType' | 'fileIndex', unknown>>(
            '/stream/:torrent(*)',
            async (req, res) => {
                const { torrent: link, ...params } = parseParams({
                    torrent: req.params.torrent,
                    ...req.query,
                })

                const torrent = await client.addTorrent(link)

                const file = filterFiles(torrent.files, params)[0]

                if (!file) {
                    throw new NotFound()
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
            }
        )
        .get('/stream', async (req, res) => {
            const { torrent, ...params } = parseParams(req.query)

            return res.redirect(
                `/stream/${encodeURIComponent(torrent)}?${stringify(params as {})}`,
                301
            )
        })
        .get<{ torrent: string }, {}, {}, Record<'file' | 'fileType' | 'fileIndex', unknown>>(
            '/playlist/:torrent(*)',
            async (req, res) => {
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

                res.send(
                    [
                        '#EXTM3U',
                        ...files.flatMap((f) => [
                            `#EXTINF:-1,${f.name}`,
                            `${domain}${getSteamUrl(link, f.path, encodeToken)}`,
                        ]),
                    ].join('\n')
                )
            }
        )
        .get('/playlist', async (req, res) => {
            const { torrent, ...params } = parseParams(req.query)

            return res.redirect(
                `/playlist/${encodeURIComponent(torrent)}?${stringify(params as {})}`,
                301
            )
        })
}
