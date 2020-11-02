import { Express } from 'express'
import { Logger } from 'winston'
import { BadRequest } from 'http-errors'

import { TorrentClient } from '../torrent'
import { Config } from '../config'
import { getProvidersInfo, search, isProviderSupported } from '../helpers/torrent-search'
import { Provider, ProviderTorrent } from '../models'
import { validateString } from '../helpers'

export function setupBrowseApi(app: Express, _config: Config, _logger: Logger, _client: TorrentClient): Express {
    app.get<{}, ProviderTorrent[], {}, Record<'query' | 'category' | 'provider', unknown>>('/api/browse/search', async (req, res) => {
        const query = validateString(req.query.query, 'query')
        const category = req.query.category ? validateString(req.query.category, 'category') : undefined
        const provider = validateString(req.query.provider, 'provider')

        if (!isProviderSupported(provider)) {
            throw new BadRequest(`Provider ${provider} is not supported`)
        }
    
        return res.json(await search([provider], query, {
            category: category,
            limit: 50
        }))
    })

    app.get<{}, Provider[], {}, {}>('/api/browse/providers', async (_req, res) => {
        return res.json(await getProvidersInfo())
    })

    return app
}