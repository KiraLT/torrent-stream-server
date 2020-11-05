import { setInterval, clearInterval } from 'timers'
import { mkdir } from 'fs'
import { promisify } from 'util'
import torrentStream from 'torrent-stream'
import parseTorrent from 'parse-torrent'
import { Logger } from 'winston'
import { lookup } from 'mime-types'
import WebTorrent from 'webtorrent'

import { Config } from './config'
import { getSteamUrl } from './helpers'

export interface Torrent {
    infoHash: string
    link: string
    name: string
    started: number
    updated: number
    files: any[]
    remove: () => Promise<void>
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
        type: string
        stream: string
    }[]
    downloaded: number
    downloadSpeed: number
}

export class TorrentError extends Error {}

export class TorrentClient {
    protected client: WebTorrent.Instance
    protected torrents: Record<string, Torrent>
    protected interval: NodeJS.Timeout

    constructor(protected config: Config, protected logger: Logger) {
        this.client = new WebTorrent()
        this.torrents = {}
        this.interval = setInterval(() => {
            this.periodCheck()
        }, 1000 * 10)
    }

    public async addAndGet(link: string): Promise<Torrent> {
        let parsedLink: parseTorrent.Instance | undefined
        try {
            parsedLink = await promisify(parseTorrent.remote)(link)
        } catch (err) {
            throw new TorrentError(
                `Cannot parse torrent: ${err instanceof Error ? err.message : err}, link: ${link}`
            )
        }

        if (!parsedLink) {
            throw new TorrentError(`Cannot parse torrent: ${link}`)
        }

        const magnet = parseTorrent.toMagnetURI(parsedLink)
        const hash = parsedLink.infoHash

        const torrent = this.get(hash)

        if (torrent) {
            return this.update(hash, {
                ...torrent,
                updated: Date.now(),
            })
        } else {
            this.logger.info(`Add new torrent from ${link}`)

            const clientTorrent = this.client.add(magnet, {
                path: this.config.torrents.path,
            })
            return new Promise((resolve, reject) => {
                clientTorrent.on('error', (e) => {
                    reject(e)
                })

                clientTorrent.on('metadata', () => {
                    clientTorrent.deselect(0, clientTorrent.pieces.length - 1, 0)
                    clientTorrent.files.forEach((file) => {
                        file.deselect()
                    })
                })

                clientTorrent.on('ready', () => {
                    const torrent = {
                        link,
                        engine: clientTorrent,
                        name: clientTorrent.name,
                        infoHash: hash,
                        files: clientTorrent.files,
                        started: Date.now(),
                        updated: Date.now(),
                    }
                    this.update(hash, {
                        ...torrent,
                        remove: async () => {
                            new Promise((resolve) => {
                                clientTorrent.destroy(
                                    {
                                        destroyStore: true,
                                    },
                                    () => {
                                        resolve()
                                    }
                                )
                            })
                        },
                        getMeta: () => ({
                            link: torrent.link,
                            infoHash: torrent.infoHash,
                            name: torrent.name,
                            files: torrent.files.map((v) => ({
                                name: v.name,
                                length: v.length,
                                path: v.path,
                                type: lookup(v.name) || '',
                                stream: getSteamUrl(torrent.link, v.path),
                            })),
                            started: torrent.started,
                            updated: torrent.updated,
                            downloadSpeed: clientTorrent.downloadSpeed,
                            downloaded: clientTorrent.downloaded,
                        }),
                    })
                    resolve(this.get(hash))
                })
            })
        }
    }

    public async periodCheck(): Promise<void> {
        const torrentToRemove = this.getAll().filter(
            (torrent) =>
                Date.now() - torrent.updated > this.config.torrents.autocleanInternal * 1000
        )
        await Promise.all(torrentToRemove.map((torrent) => this.remove(torrent.infoHash)))
    }

    public getAll(): Torrent[] {
        return Object.values(this.torrents)
    }

    public remove(infoHash: string): void {
        const torrent = this.torrents[infoHash]
        if (torrent) {
            this.logger.info(`Removing expired torrent - ${torrent.infoHash}`)
            torrent.remove()
        }
    }

    public get(infoHash: string): Torrent | undefined {
        return this.torrents[infoHash]
    }

    public has(infoHash: string): boolean {
        return infoHash in this.torrents
    }

    public update(infoHash: string, torrent: Torrent): Torrent {
        this.torrents[infoHash] = torrent
        return torrent
    }

    public stop(): void {
        clearInterval(this.interval)
    }
}
