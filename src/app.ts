import express from 'express'
import torrentStream from 'torrent-stream'
import rangeParser from 'range-parser'
import pump from 'pump'

const port = 3000

function createApp() {
    const app = express()
    app.use(express.json())
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next()
    })
    return app
}

class TorrentsStore {
    protected torrents: Record<string, TorrentStream.TorrentEngine> = {}

    public async andAndGet(link: string) {
        return new Promise<TorrentStream.TorrentEngine>((resolve) => {
            const torrent = torrentStream(link)
            if (torrent.infoHash in this.torrents) {
                resolve(this.torrents[torrent.infoHash])
            } else {
                this.torrents[torrent.infoHash] = torrent
                torrent.on('ready', () => {
                    resolve(torrent)
                })
            }
        })
    }

    public getAll(): TorrentStream.TorrentEngine[] {
        return Object.values(this.torrents)
    }
}

function setup() {
    const app = createApp()
    const store = new TorrentsStore()
    
    app.get('/status', (req, res) => res.send('ok'))

    app.get('/torrents', (req, res) => res.send(store.getAll().map(torrent => ({
        infoHash: torrent.infoHash,
        files: torrent.files.map(file => ({
            name: file.name,
            path: file.path,
            length: file.length
        }))
    }))))

    app.get('/stream', async (req, res) => {
        const link = req.query.torrent
        const fileName = req.query.file
        const headersRange = req.headers.range instanceof Array ? req.headers.range[0] : req.headers.range

        const torrent = await store.andAndGet(link)
        const file = torrent.files.find(f => f.name === fileName)
        if (!file) {
            throw "404"
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
    
        pump(file.createReadStream(range), res)
    })

    app.listen(port, () => console.log(`Listening on port ${port}!`))
}

setup()