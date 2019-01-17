import pump from 'pump'
import rangeParser from 'range-parser'
import { Express } from 'express'
import { TorrentClient, Torrent } from '../torrent'

export function setupStreamApi(app: Express, client: TorrentClient): Express {
    app.get('/stream', async (req, res) => {
        const link = req.query.torrent
        if (!link) {
            return res.send(400)
        }
        const headersRange = req.headers.range instanceof Array ? req.headers.range[0] : req.headers.range

        let torrent: Torrent
        try {
            torrent = await client.addAndGet(link)
        } catch (error) {
            return res.sendStatus(400).send(String(error))
        }
    
        const file = torrent.engine.files.find(f => f.name === req.query.file) || torrent.engine.files[0]
        if (!file) {
            return res.send(400)
        }

        const parsedRange = headersRange ? rangeParser(file.length, headersRange) : undefined
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
