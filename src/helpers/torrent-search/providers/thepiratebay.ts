import fetch from 'node-fetch'

import { Provider, ProviderSearchOptions, ProviderFeature } from '.'
import { formatMagnet } from '../helpers'
import { formatBytes } from '../../../utils'

export interface ThepiratebayItem {
    id: string;
    name: string;
    info_hash: string;
    leechers: string;
    seeders: string;
    num_files: string;
    size: string;
    username: string;
    added: string;
    status: string;
    category: string;
    imdb: string;
}

export class ThepiratebayProvider extends Provider {
    static providerName = 'ThePirateBay' as const

    trackers = [
        'udp://tracker.coppersurfer.tk:6969/announce',
        'udp://9.rarbg.to:2920/announce',
        'udp://tracker.opentrackr.org:1337',
        'udp://tracker.internetwarriors.net:1337/announce',
        'udp://tracker.leechers-paradise.org:6969/announce',
        'udp://tracker.pirateparty.gr:6969/announce',
        'udp://tracker.cyberia.is:6969/announce'
    ]

    async getMeta() {
        return {
            categories: [
                {
                    "name": "Audio",
                    "id": "100",
                    "subcategories": [
                        {
                            "name": "Music",
                            "id": "101"
                        },
                        {
                            "name": "Audio books",
                            "id": "102"
                        },
                        {
                            "name": "Sound clips",
                            "id": "103"
                        },
                        {
                            "name": "FLAC",
                            "id": "103"
                        },
                        {
                            "name": "Other",
                            "id": "199"
                        }
                    ]
                },
                {
                    "name": "Video",
                    "id": "200",
                    "subcategories": [
                        {
                            "name": "Movies",
                            "id": "201"
                        },
                        {
                            "name": "Movies DVDR",
                            "id": "202"
                        },
                        {
                            "name": "Music videos",
                            "id": "203"
                        },
                        {
                            "name": "Movie clips",
                            "id": "204"
                        },
                        {
                            "name": "TV shows",
                            "id": "205"
                        },
                        {
                            "name": "Handheld",
                            "id": "206"
                        },
                        {
                            "name": "HD - Movies",
                            "id": "207"
                        },
                        {
                            "name": "HD - TV shows",
                            "id": "208"
                        },
                        {
                            "name": "3D",
                            "id": "209"
                        },
                        {
                            "name": "Other",
                            "id": "299"
                        }
                    ]
                },
                {
                    "name": "Applications",
                    "id": "300",
                    "subcategories": [
                        {
                            "name": "Windows",
                            "id": "301"
                        },
                        {
                            "name": "Mac",
                            "id": "302"
                        },
                        {
                            "name": "UNIX",
                            "id": "303"
                        },
                        {
                            "name": "Handheld",
                            "id": "304"
                        },
                        {
                            "name": "IOS (iPad/iPhone)",
                            "id": "305"
                        },
                        {
                            "name": "Android",
                            "id": "306"
                        },
                        {
                            "name": "Other OS",
                            "id": "399"
                        }
                    ]
                },
                {
                    "name": "Games",
                    "id": "400",
                    "subcategories": [
                        {
                            "name": "PC",
                            "id": "401"
                        },
                        {
                            "name": "Mac",
                            "id": "402"
                        },
                        {
                            "name": "PSx",
                            "id": "403"
                        },
                        {
                            "name": "XBOX360",
                            "id": "404"
                        },
                        {
                            "name": "Wii",
                            "id": "405"
                        },
                        {
                            "name": "Handheld",
                            "id": "406"
                        },
                        {
                            "name": "IOS (iPad/iPhone)",
                            "id": "407"
                        },
                        {
                            "name": "Android",
                            "id": "408"
                        },
                        {
                            "name": "Other",
                            "id": "499"
                        }
                    ]
                },
                {
                    "name": "Porn",
                    "id": "500",
                    "subcategories": [
                        {
                            "name": "Movies",
                            "id": "501"
                        },
                        {
                            "name": "Movies DVDR",
                            "id": "502"
                        },
                        {
                            "name": "Pictures",
                            "id": "503"
                        },
                        {
                            "name": "Games",
                            "id": "504"
                        },
                        {
                            "name": "HD - Movies",
                            "id": "505"
                        },
                        {
                            "name": "Movie clips",
                            "id": "506"
                        },
                        {
                            "name": "Other",
                            "id": "599"
                        }
                    ]
                },
                {
                    "name": "Other",
                    "id": "600",
                    "subcategories": [
                        {
                            "name": "E-books",
                            "id": "601"
                        },
                        {
                            "name": "Comics",
                            "id": "602"
                        },
                        {
                            "name": "Pictures",
                            "id": "603"
                        },
                        {
                            "name": "Covers",
                            "id": "604"
                        },
                        {
                            "name": "Physibles",
                            "id": "605"
                        },
                        {
                            "name": "Other",
                            "id": "699"
                        }
                    ]
                }
            ],
            features: [
                ProviderFeature.Search
            ]
        }
    }

    async search(query: string, options?: ProviderSearchOptions) {
        const { category, limit }  = options || {}

        const url = `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category || '')}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Failed to load results')
        }

        const result = await response.json() as ThepiratebayItem[]

        return result.map(v => ({
            name: v.name,
            magnet: formatMagnet(v.info_hash, v.name, this.trackers),
            seeds: parseInt(v.seeders, 10),
            peers: parseInt(v.leechers, 10),
            size: formatBytes(parseInt(v.size, 10)),
            time: new Date(v.added).toString()
        }))
    }
}
