import { formatBytes } from 'common-stuff'

import {
    Provider,
    ProviderSearchOptions,
    ProviderMeta,
    ProviderTorrent,
} from '.'

const rarbgApi = require('rarbg-api')

export class RarbgProvider extends Provider {
    providerName = 'RARBG' as const
    protected domain: string = 'https://rarbg.to/torrents.php'

    protected trackers = [
        'http://tracker.trackerfix.com:80/announce',
        'udp://9.rarbg.me:2760',
        'udp://9.rarbg.to:2750',
        'udp://tracker.tallpenguin.org:15740',
        'udp://tracker.slowcheetah.org:14740',
    ]

    async getMeta(): Promise<ProviderMeta> {
        return {
            provider: this.providerName,
            categories: [
                {
                    name: 'Movies',
                    id: '14,48,17,44,45,47,50,51,52,42,46,54',
                    subcategories: [
                        {
                            name: 'Movies / XVID',
                            id: '14',
                        },
                        {
                            name: 'Movies / XVID / 720',
                            id: '48',
                        },
                        {
                            name: 'Movies / x264',
                            id: '17',
                        },
                        {
                            name: 'Movies / x264 / 1080',
                            id: '44',
                        },
                        {
                            name: 'Movies / x264 / 720',
                            id: '45',
                        },
                        {
                            name: 'Movies / x264 / 3D',
                            id: '47',
                        },
                        {
                            name: 'Movies / x264 / 4k',
                            id: '50',
                        },
                        {
                            name: 'Movies / x265 / 4k',
                            id: '51',
                        },
                        {
                            name: 'Movies / x265 / 4k / HDR',
                            id: '52',
                        },
                        {
                            name: 'Movies / Full BD',
                            id: '42',
                        },
                        {
                            name: 'Movies / BD Remux',
                            id: '46',
                        },
                        {
                            name: 'Movies / x265 / 1080',
                            id: '54',
                        },
                    ],
                },
                {
                    name: 'XXX',
                    id: '4',
                    subcategories: [],
                },
                {
                    name: 'TV Shows',
                    id: '18,41,49',
                    subcategories: [
                        {
                            name: 'TV Episodes',
                            id: '18'
                        },
                        {
                            name: 'TV HD Episodes',
                            id: '41'
                        },
                        {
                            name: 'TV UHD Episodes',
                            id: '49'
                        },
                    ],
                },
                {
                    name: 'Music',
                    id: '23,25',
                    subcategories: [
                        {
                            name: 'Music / MP3',
                            id: '23'
                        },
                        {
                            name: 'Music / FLAC',
                            id: '25'
                        },
                    ],
                },
            ],
        }
    }

    async search(
        query: string,
        options?: ProviderSearchOptions
    ): Promise<ProviderTorrent[]> {
        const { category, limit } = options || {}

        let results = await rarbgApi.search(query, {
            category: category ? category.split(',') : null,
            limit: limit || 25
        });

        return results.map((v:any) => {
            return {
                provider: this.providerName,
                id: v.download,
                name: v.title,
                seeds: v.seeders || 0,
                peers: v.leechers || 0,
                comments: 0,
                size: formatBytes(v.size),
                time: v.pubdate,
                magnet: v.download,
            }
        })
    }

    async getMagnet(id: string): Promise<string> {
        // the id is the magnet url
        return id.trim()
    }
}
