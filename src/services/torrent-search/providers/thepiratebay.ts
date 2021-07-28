import { formatBytes } from 'common-stuff'

import { Provider, ProviderSearchOptions, ProviderTorrent } from '.'
import { formatMagnet, loadJson } from '../helpers'

export interface ThepiratebayItem {
    id: string
    name: string
    info_hash: string
    leechers: string
    seeders: string
    num_files: string
    size: string
    username: string
    added: string
    status: string
    category: string
    imdb: string
}

export class ThepiratebayProvider extends Provider {
    providerName = 'ThePirateBay' as const

    protected domain: string = 'https://apibay.org'

    trackers = [
        'udp://tracker.coppersurfer.tk:6969/announce',
        'udp://9.rarbg.to:2920/announce',
        'udp://tracker.opentrackr.org:1337',
        'udp://tracker.internetwarriors.net:1337/announce',
        'udp://tracker.leechers-paradise.org:6969/announce',
        'udp://tracker.pirateparty.gr:6969/announce',
        'udp://tracker.cyberia.is:6969/announce',
    ]

    async getMeta() {
        return {
            provider: this.providerName,
            categories: [
                {
                    name: 'Audio',
                    id: '100',
                    subcategories: [
                        {
                            name: 'Music',
                            id: '101',
                        },
                        {
                            name: 'Audio books',
                            id: '102',
                        },
                        {
                            name: 'Sound clips',
                            id: '103',
                        },
                        {
                            name: 'FLAC',
                            id: '103',
                        },
                        {
                            name: 'Other',
                            id: '199',
                        },
                    ],
                },
                {
                    name: 'Video',
                    id: '200',
                    subcategories: [
                        {
                            name: 'Movies',
                            id: '201',
                        },
                        {
                            name: 'Movies DVDR',
                            id: '202',
                        },
                        {
                            name: 'Music videos',
                            id: '203',
                        },
                        {
                            name: 'Movie clips',
                            id: '204',
                        },
                        {
                            name: 'TV shows',
                            id: '205',
                        },
                        {
                            name: 'Handheld',
                            id: '206',
                        },
                        {
                            name: 'HD - Movies',
                            id: '207',
                        },
                        {
                            name: 'HD - TV shows',
                            id: '208',
                        },
                        {
                            name: '3D',
                            id: '209',
                        },
                        {
                            name: 'Other',
                            id: '299',
                        },
                    ],
                },
                {
                    name: 'Applications',
                    id: '300',
                    subcategories: [
                        {
                            name: 'Windows',
                            id: '301',
                        },
                        {
                            name: 'Mac',
                            id: '302',
                        },
                        {
                            name: 'UNIX',
                            id: '303',
                        },
                        {
                            name: 'Handheld',
                            id: '304',
                        },
                        {
                            name: 'IOS (iPad/iPhone)',
                            id: '305',
                        },
                        {
                            name: 'Android',
                            id: '306',
                        },
                        {
                            name: 'Other OS',
                            id: '399',
                        },
                    ],
                },
                {
                    name: 'Games',
                    id: '400',
                    subcategories: [
                        {
                            name: 'PC',
                            id: '401',
                        },
                        {
                            name: 'Mac',
                            id: '402',
                        },
                        {
                            name: 'PSx',
                            id: '403',
                        },
                        {
                            name: 'XBOX360',
                            id: '404',
                        },
                        {
                            name: 'Wii',
                            id: '405',
                        },
                        {
                            name: 'Handheld',
                            id: '406',
                        },
                        {
                            name: 'IOS (iPad/iPhone)',
                            id: '407',
                        },
                        {
                            name: 'Android',
                            id: '408',
                        },
                        {
                            name: 'Other',
                            id: '499',
                        },
                    ],
                },
                {
                    name: 'Porn',
                    id: '500',
                    subcategories: [
                        {
                            name: 'Movies',
                            id: '501',
                        },
                        {
                            name: 'Movies DVDR',
                            id: '502',
                        },
                        {
                            name: 'Pictures',
                            id: '503',
                        },
                        {
                            name: 'Games',
                            id: '504',
                        },
                        {
                            name: 'HD - Movies',
                            id: '505',
                        },
                        {
                            name: 'Movie clips',
                            id: '506',
                        },
                        {
                            name: 'Other',
                            id: '599',
                        },
                    ],
                },
                {
                    name: 'Other',
                    id: '600',
                    subcategories: [
                        {
                            name: 'E-books',
                            id: '601',
                        },
                        {
                            name: 'Comics',
                            id: '602',
                        },
                        {
                            name: 'Pictures',
                            id: '603',
                        },
                        {
                            name: 'Covers',
                            id: '604',
                        },
                        {
                            name: 'Physibles',
                            id: '605',
                        },
                        {
                            name: 'Other',
                            id: '699',
                        },
                    ],
                },
            ],
        }
    }

    async search(query: string, options?: ProviderSearchOptions): Promise<ProviderTorrent[]> {
        const { category, limit } = options || {}

        const url = `${this.domain}/q.php?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(
            category || ''
        )}`

        const result = await loadJson<ThepiratebayItem[]>(url)

        if (result[0]?.name === 'No results returned') {
            return []
        }

        const categories = (await this.getMeta()).categories.flatMap((v) => [
            ...v.subcategories,
            {
                id: v.id,
                name: v.name,
            },
        ])

        return result.map((v) => ({
            provider: this.providerName,
            id: v.id,
            name: v.name,
            magnet: formatMagnet(v.info_hash, v.name, this.trackers),
            seeds: parseInt(v.seeders, 10),
            peers: parseInt(v.leechers, 10),
            size: formatBytes(parseInt(v.size, 10)),
            time: new Date(parseInt(v.added) * 1000).getTime(),
            category: categories.find((c) => c.id === v.category) || {
                name: 'All',
                id: '',
            },
            numFiles: parseInt(v.num_files),
            isVip: v.status === 'vip',
            imdb: v.imdb,
            link: `https://thepiratebay.org/description.php?id=${v.id}`,
        }))
    }
}
