import fetch from 'node-fetch'
import { load } from 'cheerio'

import { Provider, ProviderSearchOptions, ProviderFeature } from '.'

export class X1337Provider extends Provider {
    static providerName = '1337x' as const

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
            categories: [
                {
                    name: 'Movies',
                    id: 'Movies',
                    subcategories: [],
                },
                {
                    name: 'TV',
                    id: 'TV',
                    subcategories: [],
                },
                {
                    name: 'Games',
                    id: 'Games',
                    subcategories: [],
                },
                {
                    name: 'Anime',
                    id: 'Anime',
                    subcategories: [],
                },
                {
                    name: 'Apps',
                    id: 'Apps',
                    subcategories: [],
                },
                {
                    name: 'Documentaries',
                    id: 'Documentaries',
                    subcategories: [],
                },
                {
                    name: 'XXX',
                    id: 'XXX',
                    subcategories: [],
                },
                {
                    name: 'Other',
                    id: 'Other',
                    subcategories: [],
                },
            ],
            features: [ProviderFeature.Search],
        }
    }

    async search(query: string, options?: ProviderSearchOptions) {
        const { category, limit } = options || {}

        const domain = 'http://www.1337x.to'
        const url = category
            ? `${domain}/category-search/${encodeURIComponent(query)}/${encodeURIComponent(
                  category || ''
              )}/1`
            : `${domain}/search/${encodeURIComponent(query)}/1/`
        const response = await fetch(url, {
            headers: {
                'User-Agent': `torrent-stream-server (+https://github.com/KiraLT/torrent-stream-server)`,
            },
        })

        if (!response.ok) {
            throw new Error('Failed to load results')
        }

        const $ = load(await response.text())

        const categories = (await this.getMeta()).categories.flatMap((v) => [
            ...v.subcategories,
            {
                id: v.id,
                name: v.name,
            },
        ])

        return $('tbody > tr')
            .get()
            .map((v) => {
                const el = $(v)

                const id = (el.find('a:nth-child(2)').attr('href') || '').trim()

                return {
                    name: el.find('a').text().trim(),
                    magnet: '',
                    seeds: parseInt(el.find('.seeds').text().trim(), 10) || 0,
                    peers: parseInt(el.find('.leeches').text().trim(), 10) || 0,
                    size: '',
                    time: 0,
                    category: categories.find((c) => c.id === v.sub_category) || {
                        name: 'All',
                        id: '',
                    },
                    link: '',
                }
            })
    }
}
