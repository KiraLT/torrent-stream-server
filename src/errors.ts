import { Logger } from 'winston'
import { Response, Request, NextFunction } from 'express'
import { HttpError } from 'http-errors'

export function handleApiErrors(
    logger: Logger
): (err: unknown, req: Request, resp: Response, next: NextFunction) => unknown {
    return (err, _req, resp, next) => {
        if (err) {
            if (err instanceof HttpError) {
                logger.warn(`${err.statusCode} error: ${err.message}`)
                return resp.status(err.statusCode).json({
                    error: err.message,
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
