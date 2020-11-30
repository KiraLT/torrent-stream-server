import { Router } from 'express'
import { Logger } from 'winston'
import { BadRequest, NotFound } from 'http-errors'

import { Config } from '../config'
import {
    getProvidersInfo,
    search,
    isProviderSupported,
    providers,
} from '../services/torrent-search'
import { ProviderModel, ProviderTorrentModel, MagnetModel } from '../models'
import { validateString } from '../helpers/validation'

export function getBrowseRouter(_config: Config, _logger: Logger): Router {
    return Router()
        .get<{}, ProviderTorrentModel[], {}, Record<'query' | 'category' | 'provider', unknown>>(
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
        .get<{}, ProviderModel[], {}, {}>('/browse/providers', async (_req, res) => {
            return res.json(await getProvidersInfo())
        })
        .get<Record<'provider' | 'torrentId', string>, MagnetModel, {}, {}>(
            '/browse/providers/:provider/magnet/:torrentId',
            async (req, res) => {
                const { provider, torrentId } = req.params

                if (!isProviderSupported(provider)) {
                    throw new NotFound(`Provider ${provider} not found`)
                }

                const magnet = await providers[provider].getMagnet(torrentId)

                if (!magnet) {
                    throw new NotFound(`Torrent ${torrentId} not found`)
                }

                return res.json({
                    magnet,
                })
            }
        )
}
