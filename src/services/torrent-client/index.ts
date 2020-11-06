import { promisify } from 'util'
import parseTorrent from 'parse-torrent'
import { Logger } from 'winston'
import { lookup } from 'mime-types'
import { BadRequest } from 'http-errors'

import { TorrentAdapter, TorrentAdapterTorrent, TorrentAdapterFile } from './adapters'

export * from './adapters'
export * from './adapters/webtorrent'

export interface TorrentClientTorrent extends TorrentAdapterTorrent {
    created: Date
    updated: Date
    infoHash: string
    link: string
    files: TorrentClientFile[]
}

export interface TorrentClientFile extends TorrentAdapterFile {
    type: string
}

export interface TorrentClientConfig {
    autocleanInternal: number
}

export class TorrentClient {
    torrents: Record<string, TorrentClientTorrent> = {}

    constructor(
        protected config: TorrentClientConfig,
        protected adapter: TorrentAdapter,
        protected logger: Logger
    ) {
        this.periodCheck()
    }

    getTorrents(): TorrentClientTorrent[] {
        return Object.values(this.torrents)
    }

    getTorrent(infoHash: string): TorrentClientTorrent | undefined {
        return this.torrents[infoHash]
    }

    async removeTorrent(infoHash: string): Promise<void> {
        const torrent = this.torrents[infoHash]
        if (torrent) {
            await torrent.remove()
            delete this.torrents[infoHash]
        }
    }

    async addTorrent(link: string): Promise<TorrentClientTorrent> {
        let parsedLink: parseTorrent.Instance | undefined
        try {
            parsedLink = await promisify(parseTorrent.remote)(link)
        } catch (err) {
            throw new BadRequest(
                `Cannot parse torrent: ${err instanceof Error ? err.message : err}, link: ${link}`
            )
        }

        if (!parsedLink) {
            throw new BadRequest(`Cannot parse torrent: ${link}`)
        }

        const magnet = parseTorrent.toMagnetURI(parsedLink)
        const infoHash = parsedLink.infoHash

        if (infoHash in this.torrents) {
            this.torrents[infoHash] = {
                ...this.torrents[infoHash],
                updated: new Date(),
            }
            return this.torrents[infoHash]
        }

        const torrent = await this.adapter.add(magnet).then((v) => ({
            ...v,
            link,
            infoHash,
            created: new Date(),
            updated: new Date(),
            files: v.files.map((f) => ({
                ...f,
                type: lookup(f.name) || '',
            })),
        }))

        this.torrents[torrent.infoHash] = torrent
        return torrent
    }

    public async periodCheck(): Promise<void> {
        const torrentToRemove = Object.values(this.torrents).filter(
            (torrent) =>
                Date.now() - torrent.updated.getTime() > this.config.autocleanInternal * 1000
        )
        for (const torrent of torrentToRemove) {
            this.logger.info(`Removing expired ${torrent.name} torrent`)
            await this.removeTorrent(torrent.infoHash)
        }
    }
}
