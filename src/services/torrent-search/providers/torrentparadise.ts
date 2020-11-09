import fetch from 'node-fetch'

import { Provider, ProviderSearchOptions, ProviderFeature, ProviderMeta, ProviderResult } from '.'
import { formatMagnet } from '../helpers'
import { formatBytes } from '../../../helpers'

export interface TorrentParadiseItem {
    id: string
    l: number
    len: number
    s: number
    text: string
}

export class TorrentParadiseProvider extends Provider {
    static providerName = 'TorrentParadise.ml' as const

    async getMeta(): Promise<ProviderMeta> {
        return {
            categories: [],
            features: [ProviderFeature.Search],
        }
    }

    async search(query: string, options?: ProviderSearchOptions): Promise<ProviderResult[]> {
        const { category, limit } = options || {}

        const url = `https://torrent-paradise.ml/api/search?q=${encodeURIComponent(query)}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Failed to load results')
        }

        const result = (await response.json()) as TorrentParadiseItem[]

        return result.map((v) => ({
            name: v.text,
            magnet: formatMagnet(v.id, v.text, []),
            seeds: v.s,
            peers: v.l,
            size: formatBytes(v.len),
            category: {
                name: 'All',
                id: '',
            },
        }))
    }
}
