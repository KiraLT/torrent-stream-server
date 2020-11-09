import { Router } from 'express'
import { Logger } from 'winston'
import { BadRequest } from 'http-errors'

import { Config } from '../config'
import { getProvidersInfo, search, isProviderSupported } from '../services/torrent-search'
import { Provider, ProviderTorrent } from '../models'
import { validateString } from '../helpers/validation'

export function getBrowseRouter(_config: Config, _logger: Logger): Router {
    return Router()
        .get<{}, ProviderTorrent[], {}, Record<'query' | 'category' | 'provider', unknown>>(
            '/browse/search',
            async (req, res) => {
                const query = validateString(req.query.query, 'query')
                const category = req.query.category
                    ? validateString(req.query.category, 'category')
                    : undefined
                const provider = validateString(req.query.provider, 'provider')

                if (!isProviderSupported(provider)) {
                    throw new BadRequest(`Provider ${provider} is not supported`)
                }

                return res.json(
                    await search([provider], query, {
                        category: category,
                        limit: 50,
                    })
                )
            }
        )
        .get<{}, Provider[], {}, {}>('/browse/providers', async (_req, res) => {
            return res.json(await getProvidersInfo())
        })
}
