import WebTorrent from 'webtorrent'
import { promisify } from 'util'
import { mkdir } from 'fs'

import { TorrentAdapter, TorrentAdapterTorrent, TorrentAdapterConfig, TorrentAdapterAddOptions } from '.'

export class WebtorrentTorrentAdapter extends TorrentAdapter {
    protected client: WebTorrent.Instance

    constructor(config: TorrentAdapterConfig) {
        super(config)
        this.client = new WebTorrent()
    }

    async add(magnet: string, options: TorrentAdapterAddOptions): Promise<TorrentAdapterTorrent> {
        await promisify(mkdir)(this.config.path, { recursive: true })

        const torrent = this.client.add(magnet, {
            path: this.config.path,
            announce: options.trackers
        })

        return new Promise((resolve, reject) => {
            torrent.on('error', (e) => {
                if (String(e).includes('duplicate torrent')) {
                    const value = this.client.get(torrent.infoHash)
                    if (value) {
                        resolve(this.createTorrentFromClient(value))
                    } else {
                        reject(e)
                    }
                } else {
                    reject(e)
                }
            })

            torrent.on('metadata', () => {
                torrent.deselect(0, torrent.pieces.length - 1, 0)
                torrent.files.forEach((file) => {
                    file.deselect()
                })
            })

            torrent.on('ready', () => {
                resolve(this.createTorrentFromClient(torrent))
            })
        })
    }

    protected createTorrentFromClient(torrent: WebTorrent.Torrent): TorrentAdapterTorrent {
        return {
            name: torrent.name,
            files: torrent.files.map((file) => ({
                name: file.name,
                path: file.path,
                length: file.length,
                createReadStream(range) {
                    return file.createReadStream(range)
                },
                stop() {
                    file.deselect()
                },
            })),
            async remove() {
                new Promise((resolve) => {
                    torrent.destroy(
                        {
                            destroyStore: true,
                        },
                        () => {
                            resolve()
                        }
                    )
                })
            },
            getDownloadSpeed() {
                return torrent.downloadSpeed
            },
            getDownloaded() {
                return torrent.downloaded
            },
            getUploadSpeed() {
                return torrent.uploadSpeed
            },
            getUploaded() {
                return torrent.uploaded
            },
        }
    }
}
