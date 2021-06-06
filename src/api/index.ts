import { Router } from 'express'
import { HttpError, HttpStatusCodes } from 'common-stuff'
import { middleware } from 'express-openapi-validator'
import swaggerUi from 'swagger-ui-express'

import { TorrentClient } from '../services/torrent-client'
import { Globals } from '../config'
import { getAuthRouter } from './auth'
import { getBrowseRouter } from './browse'
import { getStreamRouter } from './stream'
import { getTorrentsRouter } from './torrents'
import { getUsageRouter } from './usage'
import { handleApiErrors } from '../helpers/errors'
import { createRouter, openapi } from '../helpers/openapi'

export function getApiRouter(globals: Globals, client: TorrentClient): Router {
    const { config, logger } = globals
    const app = Router()

    const apiKey = config.security.apiKey || config.security.streamApi.key

    if (config.environment === 'development') {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi))
    }

    app.get('/status', (_req, res) => res.send({ status: 'ok' }))

    if (config.security.apiEnabled) {
        app.use(
            middleware({
                apiSpec: openapi,
                validateRequests: true,
                validateResponses: config.environment === 'development',
                ignorePaths: (path: string) => {
                    return !['/api', '/stream', '/playlist'].some((v) => path.startsWith(v))
                },
                validateSecurity: apiKey
                    ? {
                          handlers: {
                              apiKey: (req) => {
                                  const [type = '', token] = (
                                      req.headers.authorization || ''
                                  ).split(' ')

                                  return type.toLowerCase() === 'bearer' && token === apiKey
                              },
                          },
                      }
                    : false,
            })
        )

        app.use(
            createRouter([
                ...getAuthRouter(globals),
                ...getBrowseRouter(globals),
                ...getUsageRouter(globals),
                ...getTorrentsRouter(globals, client),
                ...getStreamRouter(globals, client),
            ])
        )

        app.use('/api/?*', () => {
            throw new HttpError(HttpStatusCodes.NOT_FOUND)
        })
    } else {
        logger.info('API is disabled according to the config')
    }

    app.use(handleApiErrors(logger))

    return app
}
