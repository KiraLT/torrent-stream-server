import WebTorrent from 'webtorrent'
import { promisify } from 'util'
import { mkdir } from 'fs'

import { TorrentAdapter, TorrentAdapterTorrent, TorrentClientError } from '.'

export class WebtorrentAdapter extends TorrentAdapter {
    protected client: WebTorrent.Instance

    constructor(options?: {downloadLimit?: number, uploadLimit?: number}) {
        super(options)
        this.client = new WebTorrent({
            ...{
                downloadLimit: options?.downloadLimit ?? -1,
                uploadLimit: options?.uploadLimit ?? -1
            } as any
        })
    }

    async add(magnet: string, path: string): Promise<TorrentAdapterTorrent> {
        await promisify(mkdir)(path, { recursive: true })

        const torrent = this.client.add(magnet, {
            path,
        })

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                torrent.destroy(
                    {
                        destroyStore: true,
                    },
                    () => {
                        if (torrent.numPeers === 0) {
                            reject(
                                new TorrentClientError(
                                    'Timeout while loading torrent: no peers found'
                                )
                            )
                        } else {
                            reject(new TorrentClientError('Timeout while loading torrent'))
                        }
                    }
                )
            }, 10 * 1000)

            torrent.on('error', (e) => {
                clearTimeout(timeout)

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
                clearTimeout(timeout)

                resolve(this.createTorrentFromClient(torrent))
            })
        })
    }

    async destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.destroy((err) => {
                if (err instanceof Error) {
                    reject(err)
                } else {
                    resolve()
                }
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
                new Promise<void>((resolve, reject) => {
                    torrent.destroy(
                        {
                            destroyStore: true,
                        },
                        (err) => {
                            if (err instanceof Error) {
                                reject(err)
                            } else {
                                resolve()
                            }
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
