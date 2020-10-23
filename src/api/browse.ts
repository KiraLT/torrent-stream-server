import { enablePublicProviders, search, getActiveProviders, addProvider, enableProvider, Torrent } from 'torrent-search-api'
import { si } from 'nyaapi'
import { Express } from 'express'
import { Logger } from 'winston'

import { TorrentClient } from '../torrent'
import { Config } from '../config'

export interface BrowseTorrent {
    name: string
    magnet: string
    seeds?: number
    peers?: number
    downloads?: number
    size: string
    time: string
}

export interface BrowseProvider {
    name: string
    categories: string[]
}

interface SearchTorrent extends Torrent {
    peers?: number
    seeds?: number
    downloads?: number
}

class NyaaProvider {
    name = 'Nyaa'
    categories: Record<string, string> = {
        'Anime': '0_0',
        'Anime - AMV': '1_1',
        'Anime - English': '1_2',
        'Anime - Non-English': '1_3',
        'Anime - Raws': '1_4',
        'Audio': '2_0',
        'Audio - Lossless': '2_1',
        'Audio - Lossy': '2_2',
        'Literature': '3_0',
        'Literature - English': '3_1',
        'Literature - Non-English': '3_2',
        'Literature - Raws': '3_3',
        'Live Action': '4_0',
        'Live Action - English': '4_1',
        'Live Action - Idol/PV': '4_2',
        'Live Action - Non-English': '4_3',
        'Live Action - Raws': '4_4',
        'Pictures': '5_0',
        'Pictures - Graphics': '5_0',
        'Pictures - Photos': '5_2',
        'Software': '6_0',
        'Software - Apps': '6_1',
        'Software - Games': '6_1',
    }
    isActive: boolean = false

    async search(query: string, category: string, limit: number): Promise<SearchTorrent[]> {
        const result = await si.search(query, limit, category in this.categories ? {
            category: this.categories[category] as si.Category
        } : undefined)
        return result.map(v => ({
            title: v.name,
            magnet: v.magnet,
            seeds: parseInt(v.seeders, 10) || 0,
            peers: parseInt(v.leechers, 10) || 0,
            size: v.filesize,
            provider: this.name,
            desc: '',
            time: v.date,
            downloads: parseInt(v.completed, 10) || 0
        }))
    }

    getCategories(): string[] {
        return Object.keys(this.categories)
    }

    getInformations(): { name: string; categories: string[] } {
        return {
            name: this.name,
            categories: this.getCategories()
        }
    }

    enableProvider(): void {
        this.isActive = true
    }
}

export function setupBrowseApi(app: Express, _config: Config, _logger: Logger, _client: TorrentClient): Express {
    addProvider(new NyaaProvider() as any)
    enableProvider('Nyaa')
    enablePublicProviders()

    app.get<{provider: string}, BrowseTorrent[], {}, {q: unknown; c: unknown}>('/api/browse/search/:provider', async (req, res) => {
        const query = req.query.q
        const category = req.query.c
        const provider = req.params.provider

        if (typeof query !== 'string' || typeof category !== 'string' || typeof provider !== 'string') {
            return res.json([])
        }
        const result = await search([provider], query, category, 100)
        return res.json(result.map(v => ({
            name: v.title,
            magnet: v.magnet,
            peers: (v as any).peers || 0,
            seeds: (v as any).seeds || 0,
            size: v.size,
            downloads: (v as any).downloads,
            time: v.time
        })))
    })

    app.get<{}, BrowseProvider[], {}, {}>('/api/browse/providers', async (_req, res) => {
        return res.json(getActiveProviders().map(v => ({
            name: v.name,
            categories: v.categories,
        })))
    })

    return app
}