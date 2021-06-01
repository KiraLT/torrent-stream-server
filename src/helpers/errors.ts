import { Response, Request, NextFunction } from 'express'
import { HttpError, Logger } from 'common-stuff'

import { TorrentClientError } from '../services/torrent-client'

export function handleApiErrors(
    logger: Logger
): (err: unknown, req: Request, resp: Response, next: NextFunction) => unknown {
    return (err, _req, resp, next) => {
        if (err) {
            if (err instanceof TorrentClientError) {
                logger.warn(`Torrent client error: ${err.message}`)
                return resp.status(400).json({
                    error: err.message,
                })
            } else if (err instanceof HttpError) {
                logger.warn(`${err.status} error: ${err.message}`)
                return resp.status(err.status).json({
                    error: err.message,
                })
            } else if (err instanceof Error && 'status' in err) {
                const status = (err as any).status
                const message = (err as any).message
                logger.warn(`${status} error: ${message}`)
                return resp.status(status).json({
                    error: message,
                })
            } else if (String(err).includes('JSON at position')) {
                logger.warn(String(err))
                resp.status(400).json({
                    error: 'invalid JSON',
                })
            } else {
                logger.error(String(err))
                return resp.status(500).json({
                    error: 'unknown error',
                })
            }
        }
        next(err)
    }
}
