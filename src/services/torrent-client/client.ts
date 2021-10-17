import { promisify } from 'util'
import parseTorrent from 'parse-torrent'
import { Logger, deduplicate } from 'common-stuff'
import { lookup } from 'mime-types'

import {
    downloadTrackers,
    TorrentAdapter,
    TorrentAdapterTorrent,
    TorrentAdapterFile,
    WebtorrentAdapter,
    TorrentClientError,
} from '.'

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
    useDefaultTrackers?: boolean
    announce?: string[]
    urlList?: string[]
    peerAddresses?: string[]
    uploadLimit?: number
    downloadLimit?: number
    ttl: number
    path: string
    logger: Logger
}

export class TorrentClient {
    protected torrents: Record<string, TorrentClientTorrent> = {}
    protected cleanLocked: boolean = false
    protected adapter: TorrentAdapter
    protected isLoading: Promise<void>
    protected config: TorrentClientConfig

    constructor(config: TorrentClientConfig, adapter?: TorrentAdapter) {
        this.config = config
        this.adapter =
            adapter ??
            new WebtorrentAdapter({
                downloadLimit: config.downloadLimit,
                uploadLimit: config.uploadLimit,
            })
        this.isLoading = config.useDefaultTrackers
            ? downloadTrackers()
                  .then((v) => {
                      config.logger.debug(`Loaded ${v.length} default trackers`)
                      this.config = {
                          ...this.config,
                          announce: deduplicate([
                              ...(config.announce ?? []),
                              ...v,
                          ]),
                      }
                  })
                  .catch(() => {
                      config.logger.warn('Failed to load tracker list')
                  })
            : Promise.resolve()
    }

    protected async loadAndWait(): Promise<void> {
        await this.isLoading
    }

    getTorrents(): TorrentClientTorrent[] {
        return Object.values(this.torrents)
    }

    getTorrent(infoHash: string): TorrentClientTorrent | undefined {
        return this.torrents[infoHash]
    }

    async removeTorrent(infoHash: string): Promise<void> {
        await this.isLoading

        const torrent = this.torrents[infoHash]
        if (torrent) {
            await torrent.remove()
            delete this.torrents[infoHash]
        }
    }

    async addTorrent(link: string): Promise<TorrentClientTorrent> {
        await this.isLoading

        let parsedLink: parseTorrent.Instance | undefined
        try {
            parsedLink = await promisify(parseTorrent.remote)(link)
        } catch (err) {
            throw new TorrentClientError(
                `Cannot parse torrent: ${
                    err instanceof Error ? err.message : err
                }, link: ${link}`
            )
        }

        if (!parsedLink) {
            throw new TorrentClientError(`Cannot parse torrent: ${link}`)
        }

        const magnet = parseTorrent.toMagnetURI({
            ...parsedLink,
            announce: deduplicate([
                ...(parsedLink.announce || []),
                ...(this.config.announce || []),
            ]),
            urlList: deduplicate([
                ...(parsedLink.urlList || []),
                ...(this.config.urlList || []),
            ]),
            // @ts-ignore
            peerAddresses: deduplicate([
                // @ts-ignore
                ...(parsedLink.peerAddresses || []),
                ...(this.config.peerAddresses || []),
            ]),
        })

        const infoHash = parsedLink.infoHash

        const foundTorrent = this.torrents[infoHash]
        if (foundTorrent) {
            this.torrents[infoHash] = {
                ...foundTorrent,
                updated: new Date(),
            }
            return foundTorrent
        }

        const torrent = await this.adapter
            .add(magnet, this.config.path)
            .then((v) => ({
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
        
        this.config.logger.info(`Adding new torrent "${torrent.name}"`)

        this.torrents[torrent.infoHash] = torrent

        setTimeout(() => {
            this.checkForExpiredTorrents().catch((err) => {
                this.config.logger.error(err)
            })
        }, 1000)

        return torrent
    }

    async destroy(): Promise<void> {
        await this.isLoading

        this.config.logger.info('Closing torrent client')

        await this.adapter.destroy()
    }

    protected async checkForExpiredTorrents(): Promise<void> {
        await this.isLoading

        if (this.cleanLocked) {
            return
        }
        this.cleanLocked = true
        try {
            const torrentToRemove = Object.values(this.torrents).filter(
                (torrent) =>
                    Date.now() - torrent.updated.getTime() >
                    this.config.ttl * 1000
            )
            for (const torrent of torrentToRemove) {
                this.config.logger.info(
                    `Removing expired ${torrent.name} torrent`
                )
                await this.removeTorrent(torrent.infoHash)
            }
        } finally {
            this.cleanLocked = false
        }
    }
}
