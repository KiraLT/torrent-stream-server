import { setInterval, clearInterval } from 'timers'
import { join } from 'path'
import { mkdir } from 'fs'
import { promisify } from 'util'

import torrentStream from 'torrent-stream'
import parseTorrent from 'parse-torrent'
import { Logger } from 'winston'

import { Config } from './config'

export interface Torrent {
    engine: TorrentStream.TorrentEngine
    infoHash: string
    started: number
    updated: number
}

export class TorrentClient {
    protected torrents: Record<string, Torrent>
    protected interval: NodeJS.Timeout
    protected onStartExecuted: boolean = false

    constructor(protected config: Config, protected logger: Logger) {
        this.torrents = {}
        this.interval = setInterval(() => {
            this.periodCheck()
        }, 1000*10)
    }

    public async addAndGet(link: string): Promise<Torrent> {
        return new Promise<Torrent>((resolve) => {
            const info = parseTorrent(link)
            const hash =  info.infoHash
            if (!hash) {
                throw `Torrent hash not found for ${link}`
            }
            if (hash in this.torrents) {
                const torrent = {
                    ...this.torrents[hash],
                    updated: Date.now()
                }
                this.torrents[hash] = torrent
                resolve(torrent)
            } else {
                this.logger.info(`Add new torrent from ${link}`)
                const torrent = {
                    engine: torrentStream(link, {
                        path: join(this.config.torrents.path, hash)
                    }),
                    infoHash: hash,
                    started: Date.now(),
                    updated: Date.now()
                }
                this.torrents[hash] = torrent
                torrent.engine.on('ready', () => {
                    resolve(torrent)
                })
            }
        })
    }

    public async periodCheck(): Promise<void> {
        await this.onStart()
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

    protected async onStart(): Promise<void> {
        if (!this.onStartExecuted) {
            this.logger.info('Preparing torrents directory')
            this.onStartExecuted = true
            await promisify(mkdir)(this.config.torrents.path, {recursive: true})
        }
    }
}
