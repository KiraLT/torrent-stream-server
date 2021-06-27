import { formatBytes } from 'common-stuff'

import { Provider, ProviderSearchOptions, ProviderMeta, ProviderTorrent } from '.'
import { formatMagnet, loadJson } from '../helpers'

export interface TorrentParadiseItem {
    id: string
    l: number
    len: number
    s: number
    text: string
}

export class TorrentParadiseProvider extends Provider {
    providerName = 'TorrentParadise.ml' as const

    protected domain: string = 'https://torrent-paradise.ml'

    async getMeta(): Promise<ProviderMeta> {
        return {
            provider: this.providerName,
            categories: [],
        }
    }

    async search(query: string, options?: ProviderSearchOptions): Promise<ProviderTorrent[]> {
        const {} = options || {}

        const url = `${this.domain}/api/search?q=${encodeURIComponent(query)}`
        const result = await loadJson<TorrentParadiseItem[]>(url)

        return result.map((v) => ({
            provider: this.providerName,
            id: v.id,
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
