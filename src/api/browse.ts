import { Express } from 'express'
import { Logger } from 'winston'

import { TorrentClient } from '../torrent'
import { Config } from '../config'
import { getProvidersInfo, ProviderInfo, search, isProviderSupported } from '../helpers/torrent-search'

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


export function setupBrowseApi(app: Express, _config: Config, _logger: Logger, _client: TorrentClient): Express {
    app.get<{}, BrowseTorrent[], {}, {q: unknown; c: unknown; p: string}>('/api/browse/search', async (req, res) => {
        const query = req.query.q
        const category = req.query.c
        const provider = req.query.p

        if (typeof query !== 'string' || typeof category !== 'string' || !isProviderSupported(provider)) {
            return res.json([])
        }
    
        const result = await search([provider], query, {
            category: category,
            limit: 50
        })
        return res.json(result)
    })

    app.get<{}, ProviderInfo[], {}, {}>('/api/browse/providers', async (_req, res) => {
        return res.json(await getProvidersInfo())
    })

    return app
}