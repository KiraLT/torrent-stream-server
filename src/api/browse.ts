import { HttpError, HttpStatusCodes } from 'common-stuff'

import { Globals } from '../config'
import {
    getMeta,
    search,
    defaultProviders,
    getDefaultProvider,
    getDefaultProviders
} from '../services/torrent-search'
import { createRoute, Route } from '../helpers/openapi'

export function getBrowseRouter({}: Globals): Route[] {
    return [
        createRoute('searchTorrents', async (req, resp) => {
            const { providers: providerNames, query, category } = req.query

            return resp.json(
                await search(providerNames ? getDefaultProviders(providerNames) : defaultProviders, query, {
                    category: category,
                    limit: 50,
                })
            )
        }),
        createRoute('getProviders', async (_req, resp) => {
            return resp.json(await getMeta(defaultProviders))
        }),
        createRoute('getMagnet', async (req, res) => {
            const { provider, torrentId } = req.params

            const magnet = await getDefaultProvider(provider).getMagnet(torrentId)

            if (!magnet) {
                throw new HttpError(HttpStatusCodes.NOT_FOUND, `Torrent ${torrentId} not found`)
            }

            return res.json({
                magnet,
            })
        }),
    ]
}
