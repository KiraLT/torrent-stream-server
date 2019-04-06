import pump from 'pump'
import rangeParser from 'range-parser'
import { Express } from 'express'
import { Logger } from 'winston'

import { TorrentClient, Torrent } from '../torrent'
import { Config } from '../config'
import { verifyJwrRoken } from '../utils'

type UrlParams = {
    torrent?: string
    file?: string
} | undefined

export function setupStreamApi(app: Express, config: Config, logger: Logger, client: TorrentClient): Express {
    app.get('/stream', async (req, res) => {
        const data: UrlParams = config.security.streamApi ?
            verifyJwrRoken(String(req.query.token), config.security.streamApi.key, config.security.streamApi.maxAge) :
            req.query
        if (!data) {
            logger.warn(`Access denied`)
            return res.send(403)
        }
    
        const link = data.torrent
        if (!link) {
            return res.send(400)
        }

        let torrent: Torrent
        try {
            torrent = await client.addAndGet(link)
        } catch (error) {
            logger.warn(`Bad torrent: ${error}`)
            return res.sendStatus(400).send(String(error))
        }
    
        const file = torrent.engine.files.find(f => f.name === data.file) || torrent.engine.files[0]
        if (!file) {
            return res.send(400)
        }

        const parsedRange = req.headers.range ? rangeParser(file.length, req.headers.range) : undefined
        const range = parsedRange instanceof Array ? parsedRange[0] : undefined

        res.setHeader('Accept-Ranges', 'bytes');
        res.type(file.name);
        req.connection.setTimeout(3600000);

        if (!range) {
            res.setHeader('Content-Length', file.length);
            if (req.method === 'HEAD') {
                return res.end();
            }
            return pump(file.createReadStream(), res);
        }
        
        res.statusCode = 206;
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length);
    
        if (req.method === 'HEAD') {
            return res.end();
        }
    
        return pump(file.createReadStream(range), res)
    })
    return app
}
