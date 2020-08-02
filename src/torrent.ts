import { setInterval, clearInterval } from 'timers'
import { mkdir } from 'fs'
import { promisify } from 'util'

import torrentStream from 'torrent-stream'
import parseTorrent from 'parse-torrent'
import { Logger } from 'winston'

import { Config } from './config'

export interface Torrent {
    link: string
    engine: TorrentStream.TorrentEngine
    infoHash: string
    name: string
    started: number
    updated: number
    files: TorrentStream.TorrentEngine['files']
    getMeta: () => TorrentMeta
}

export interface TorrentMeta {
    link: string
    infoHash: string
    name: string
    started: number
    updated: number
    files: {
        name: string
        path: string
        length: number
    }[]
    downloaded: number
    downloadSpeed: number
}

export class TorrentClient {
    protected torrents: Record<string, Torrent>
    protected interval: NodeJS.Timeout

    constructor(protected config: Config, protected logger: Logger) {
        this.torrents = {}
        this.interval = setInterval(() => {
            this.periodCheck()
        }, 1000*10)
    }

    static async create(config: Config, logger: Logger): Promise<TorrentClient> {
        const client = new TorrentClient(config, logger)
    
        logger.info(`Preparing torrent directory - ${config.torrents.path}`)
        await promisify(mkdir)(config.torrents.path, {recursive: true})

        return client
    }

    public async addAndGet(link: string): Promise<Torrent> {
        return new Promise<Torrent>((resolve) => {
            const info = parseTorrent(link)
            const hash =  info.infoHash
    
            if (!hash) {
                throw `Torrent hash not found for ${link}`
            }

            const torrent = this.get(hash)

            if (torrent) {
                this.update(hash, {
                    ...torrent,
                    updated: Date.now()
                })
                resolve(this.get(hash))
            } else {
                this.logger.info(`Add new torrent from ${link}`)
                const engine = torrentStream(link, {
                    tmp: this.config.torrents.path
                })
                engine.on('ready', () => {
                    const torrent = {
                        link,
                        engine,
                        name: (engine as any).torrent.name,
                        infoHash: hash,
                        files: engine.files,
                        started: Date.now(),
                        updated: Date.now(),
                    }
                    this.update(hash, {
                        ...torrent,
                        getMeta: () => ({
                            link: torrent.link,
                            infoHash: torrent.infoHash,
                            name: torrent.name,
                            files: torrent.files.map(v => ({
                                name: v.name,
                                length: v.length,
                                path: v.path
                            })),
                            started: torrent.started,
                            updated: torrent.updated,
                            downloadSpeed: (engine.swarm as any).downloadSpeed(),
                            downloaded: engine.swarm.downloaded
                        })
                    })
                    resolve(this.get(hash))
                })
            }
        })
    }

    public async periodCheck(): Promise<void> {
        const torrentToRemove = this.getAll().filter(torrent => Date.now() - torrent.updated > this.config.torrents.autocleanInternal * 1000)
        await Promise.all(torrentToRemove.map(torrent => this.remove(torrent.infoHash)))
    }

    public getAll(): Torrent[] {
        return Object.values(this.torrents)
    }

    public remove(infoHash: string): void {
        const torrent = this.torrents[infoHash]
        if (torrent) {
            this.logger.info(`Removing expired torrent - ${torrent.infoHash}`)
            torrent.engine.remove(false, () => {
                torrent.engine.destroy(() => {
                    delete this.torrents[infoHash]
                    this.logger.info(`Torrent removed - ${torrent.infoHash}`)
                })
            })
        } 
    }

    public get(infoHash: string): Torrent | undefined {
        return this.torrents[infoHash]
    }

    public has(infoHash: string): boolean {
        return infoHash in this.torrents
    }

    public update(infoHash: string, torrent: Torrent): void {
        this.torrents[infoHash] = torrent
    }

    public stop(): void {
        clearInterval(this.interval)
    }
}
