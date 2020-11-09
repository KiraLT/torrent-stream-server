import pump from 'pump'
import rangeParser from 'range-parser'
import { Express } from 'express'
import { Logger } from 'winston'
import { Forbidden, NotFound, BadRequest } from 'http-errors'
import { stringify } from 'querystring'

import { TorrentClient, findFile } from '../services/torrent-client'
import { Config } from '../config'
import { verifyJwtToken } from '../helpers'
import { validateString, validateInt } from '../helpers/validation'

export function setupStreamApi(
    app: Express,
    config: Config,
    _logger: Logger,
    client: TorrentClient
): Express {
    app.get<{ torrent: string }, {}, {}, Record<'file' | 'fileType' | 'fileIndex', unknown>>(
        '/stream/:torrent(*)',
        async (req, res) => {
            const encodeToken = config.security.streamApi.key || config.security.apiKey

            // If security is enabled, require encoded torrent with JWT
            const data = encodeToken
                ? verifyJwtToken<Record<'torrent' | 'file' | 'fileType' | 'fileIndex', unknown>>(
                      req.params.torrent,
                      encodeToken,
                      config.security.streamApi.maxAge
                  )
                : {
                      ...req.query,
                      torrent: req.params.torrent,
                  }

            if (!data) {
                throw new Forbidden('Incorrect JWT encoding')
            }

            if (encodeToken && Object.values(req.query).some((v) => !!v)) {
                throw new BadRequest(`All parameters should be encoded with JWT`)
            }

            const torrent = await client.addTorrent(validateString(data.torrent, 'torrent'))

            const file = findFile(torrent.files, {
                file: data.file ? validateString(data.file, 'file') : undefined,
                fileIndex: data.fileIndex ? validateInt(data.fileIndex, 'fileIndex') : undefined,
                fileType: data.fileType ? validateString(data.fileType, 'fileType') : undefined,
            })

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

    app.get('/stream', async (req, res) => {
        const torrent =
            'token' in req.query
                ? validateString(req.query.token, 'token')
                : validateString(req.query.torrent, 'torrent')

        return res.redirect(
            `/stream/${encodeURIComponent(torrent)}?${stringify({
                file: 'file' in req.query ? validateString(req.query.file, 'file') : undefined,
                fileIndex:
                    'fileIndex' in req.query
                        ? validateInt(req.query.fileIndex, 'fileIndex')
                        : undefined,
                fileType:
                    'fileType' in req.query
                        ? validateString(req.query.fileType, 'fileType')
                        : undefined,
            })}`,
            301
        )
    })

    return app
}
