import { HttpError, HttpStatusCodes } from 'common-stuff'

import { Globals } from '../config'
import {
    getProvidersInfo,
    search,
    isProviderSupported,
    providers,
} from '../services/torrent-search'
import { createRoute, Route } from '../helpers/openapi'

export function getBrowseRouter({}: Globals): Route[] {
    return [
        createRoute('searchTorrents', async (req, resp) => {
            const { provider, query, category } = req.query

            if (!isProviderSupported(provider)) {
                throw new HttpError(
                    HttpStatusCodes.BAD_REQUEST,
                    `Provider ${provider} is not supported`
                )
            }

            return resp.json(
                await search([provider], query, {
                    category: category,
                    limit: 50,
                })
            )
        }),
        createRoute('getProviders', async (_req, resp) => {
            return resp.json(await getProvidersInfo())
        }),
        createRoute('getMagnet', async (req, res) => {
            const { provider, torrentId } = req.params

            if (!isProviderSupported(provider)) {
                throw new HttpError(HttpStatusCodes.NOT_FOUND, `Provider ${provider} not found`)
            }

            const magnet = await providers[provider].getMagnet(torrentId)

            if (!magnet) {
                throw new HttpError(HttpStatusCodes.NOT_FOUND, `Torrent ${torrentId} not found`)
            }

            return res.json({
                magnet,
            })
        }),
    ]
}
