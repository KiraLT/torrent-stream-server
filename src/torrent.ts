import torrentStream from 'torrent-stream'
import parseTorrent from 'parse-torrent'
import { setInterval, clearInterval } from 'timers'

export interface Torrent {
    engine: TorrentStream.TorrentEngine
    infoHash: string
    started: number
    updated: number
}

export class TorrentClient {
    protected torrents: Record<string, Torrent>
    protected interval: NodeJS.Timeout

    constructor() {
        this.torrents = {}
        this.interval = setInterval(() => {
            this.periodCheck()
        }, 1000*10)
    }

    public async addAndGet(link: string): Promise<Torrent> {
        return new Promise<Torrent>((resolve) => {
            const info = parseTorrent(link)
            if (info.infoHash! in this.torrents) {
                const torrent = {
                    ...this.torrents[info.infoHash!],
                    updated: Date.now()
                }
                this.torrents[info.infoHash!] = torrent
                resolve(torrent)
            } else {
                const torrent = {
                    engine: torrentStream(link),
                    infoHash: info.infoHash!,
                    started: Date.now(),
                    updated: Date.now()
                }
                this.torrents[info.infoHash!] = torrent
                torrent.engine.on('ready', () => {
                    resolve(torrent)
                })
            }
        })
    }

    public periodCheck(): void {
        this.getAll().forEach(torrent => {
            if (Date.now() - torrent.updated > 60*60*24) {
                torrent.engine.remove(false, () => {
                    torrent.engine.destroy(() => {
                        //
                    })
                })
            }
        })
    }

    public getAll(): Torrent[] {
        return Object.values(this.torrents)
    }

    public stop(): void {
        clearInterval(this.interval)
    }
}
