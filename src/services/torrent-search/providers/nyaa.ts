import { si } from 'nyaapi'

import { Provider, ProviderSearchOptions, ProviderMeta, ProviderTorrent } from '.'

export class NyaaProvider extends Provider {
    providerName = 'Nyaa' as const

    async getMeta(): Promise<ProviderMeta> {
        return {
            provider: this.providerName,
            categories: [
                {
                    name: 'Anime',
                    id: '1_0',
                    subcategories: [
                        {
                            name: 'AMV',
                            id: '1_1',
                        },
                        {
                            name: 'English',
                            id: '1_2',
                        },
                        {
                            name: 'Non-English',
                            id: '1_3',
                        },
                        {
                            name: 'Raws',
                            id: '1_4',
                        },
                    ],
                },
                {
                    name: 'Audio',
                    id: '2_0',
                    subcategories: [
                        {
                            name: 'Audio - Lossless',
                            id: '2_1',
                        },
                        {
                            name: 'Audio - Lossy',
                            id: '2_2',
                        },
                    ],
                },
                {
                    name: 'Literature',
                    id: '3_0',
                    subcategories: [
                        {
                            name: 'Literature - English',
                            id: '3_1',
                        },
                        {
                            name: 'Literature - Non-English',
                            id: '3_2',
                        },
                        {
                            name: 'Literature - Raws',
                            id: '3_3',
                        },
                    ],
                },
                {
                    name: 'Live Action',
                    id: '4_0',
                    subcategories: [
                        {
                            name: 'Live Action - English',
                            id: '4_1',
                        },
                        {
                            name: 'Live Action - Idol/PV',
                            id: '4_2',
                        },
                        {
                            name: 'Live Action - Non-English',
                            id: '4_3',
                        },
                        {
                            name: 'Live Action - Raws',
                            id: '4_4',
                        },
                    ],
                },
                {
                    name: 'Pictures',
                    id: '5_0',
                    subcategories: [
                        {
                            name: 'Pictures - Graphics',
                            id: '5_1',
                        },
                        {
                            name: 'Pictures - Photos',
                            id: '5_2',
                        },
                    ],
                },
                {
                    name: 'Software',
                    id: '6_0',
                    subcategories: [
                        {
                            name: 'Software - Apps',
                            id: '6_1',
                        },
                        {
                            name: 'Software - Games',
                            id: '6_2',
                        },
                    ],
                },
            ],
        }
    }

    async search(query: string, options?: ProviderSearchOptions): Promise<ProviderTorrent[]> {
        const { category, limit } = options || {}

        const result = await si.search(query, limit, {
            category: category as si.Category | undefined,
        })

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
            magnet: v.magnet,
            seeds: parseInt(v.seeders, 10) || 0,
            peers: parseInt(v.leechers, 10) || 0,
            size: v.filesize,
            time: Date.parse(v.date),
            downloads: parseInt(v.completed, 10) || 0,
            category: categories.find((c) => c.id === v.sub_category) || {
                name: 'All',
                id: '',
            },
            link: `https://nyaa.si/view/${v.id}`,
        }))
    }
}
