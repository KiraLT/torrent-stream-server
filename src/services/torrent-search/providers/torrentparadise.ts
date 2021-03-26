import { Provider, ProviderSearchOptions, ProviderMeta, ProviderTorrent } from '.'
import { formatMagnet, loadJson } from '../helpers'
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

    protected domain: string = 'https://torrent-paradise.ml'

    async getMeta(): Promise<ProviderMeta> {
        return {
            categories: [],
        }
    }

    async search(query: string, options?: ProviderSearchOptions): Promise<ProviderTorrent[]> {
        const {} = options || {}

        const url = `${this.domain}/api/search?q=${encodeURIComponent(query)}`
        const result = await loadJson<TorrentParadiseItem[]>(url)

        return result.map((v) => ({
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

    public async getMagnet(): Promise<string> {
        throw new Error('')
    }
}
