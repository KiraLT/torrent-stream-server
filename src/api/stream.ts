import pump from 'pump'
import rangeParser from 'range-parser'
import { Express } from 'express'
import { Logger } from 'winston'
import { Forbidden, NotFound } from 'http-errors'

import { TorrentClient } from '../services/torrent-client'
import { Config } from '../config'
import { verifyJwtToken } from '../helpers'
import { validateString } from '../helpers/validation'

export function setupStreamApi(
    app: Express,
    config: Config,
    _logger: Logger,
    client: TorrentClient
): Express {
    app.get<{}, {}, {}, Record<'torrent' | 'file' | 'token', unknown>>(
        '/stream',
        async (req, res) => {
            const encodeToken = config.security.streamApi.key || config.security.apiKey

            const data = encodeToken
                ? verifyJwtToken<Record<'torrent' | 'file', unknown>>(
                      validateString(req.query.token, 'token'),
                      encodeToken,
                      config.security.streamApi.maxAge
                  )
                : req.query

            if (!data) {
                throw new Forbidden()
            }

            const link = validateString(data.torrent, 'torrent')
            const fileName = validateString(data.file, 'file')

            const torrent = await client.addTorrent(link)

            const file =
                torrent.files.find((f) => f.path === fileName) ||
                torrent.files.find((f) => f.name === fileName) ||
                torrent.files.find((f) => f.type.includes('video')) ||
                torrent.files[0]

            if (!file) {
                throw new NotFound()
            }

            res.statusCode = 200
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

    return app
}
