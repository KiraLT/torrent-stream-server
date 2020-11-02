import pump from 'pump'
import rangeParser from 'range-parser'
import { Express } from 'express'
import { Logger } from 'winston'
import { lookup } from 'mime-types'
import { Forbidden, BadRequest, NotFound } from 'http-errors'

import { TorrentClient, Torrent } from '../torrent'
import { Config } from '../config'
import { verifyJwrRoken } from '../utils'
import { validateString } from '../helpers'

type UrlParams =
    | {
          torrent?: string
          file?: string
      }
    | undefined

export function setupStreamApi(
    app: Express,
    config: Config,
    logger: Logger,
    client: TorrentClient
): Express {
    app.get('/stream', async (req, res) => {
        const data: UrlParams = config.security.streamApi
            ? verifyJwrRoken(
                  String(req.query.token),
                  config.security.streamApi.key,
                  config.security.streamApi.maxAge
              )
            : req.query

        if (!data) {
            throw new Forbidden()
        }

        const link = validateString(data.torrent, 'torrent')
        const fileName = validateString(data.file, 'file')

        if (!link) {
            return res.send(400)
        }

        let torrent: Torrent
        try {
            torrent = await client.addAndGet(link)
        } catch (error) {
            return new BadRequest(String(error))
        }

        const file =
            torrent.files.find((f) => f.path === fileName) ||
            torrent.files.find((f) => f.name === fileName) ||
            torrent.files[0]

        if (!file) {
            return new NotFound()
        }

        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`)
        res.setHeader(
            'Content-Type',
            lookup(file.name) || 'application/octet-stream'
        )

        const parsedRange = req.headers.range
            ? rangeParser(file.length, req.headers.range)
            : undefined
        const range = parsedRange instanceof Array ? parsedRange[0] : undefined

        res.setHeader('Accept-Ranges', 'bytes')
        res.type(file.name)
        req.connection.setTimeout(3600000)

        if (!range) {
            res.setHeader('Content-Length', file.length)
            if (req.method === 'HEAD') {
                return res.end()
            }
            return pump(file.createReadStream(), res)
        }

        res.statusCode = 206
        res.setHeader('Content-Length', range.end - range.start + 1)
        res.setHeader(
            'Content-Range',
            'bytes ' + range.start + '-' + range.end + '/' + file.length
        )

        if (req.method === 'HEAD') {
            return res.end()
        }

        return pump(file.createReadStream(range), res)
    })
    return app
}
