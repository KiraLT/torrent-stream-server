import { Logger } from "winston"
import { Response, Request, NextFunction } from 'express'


export class HttpError extends Error {
    constructor(message: string, public code = 200) {
        super(message)
    }
}

export class ValidationError extends HttpError {
    constructor(message: string, code = 400) {
        super(message, code)
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'resource not found', code = 404) {
        super(message, code)
    }
}

export class AlreadyExistsError extends HttpError {
    constructor(message = 'resource already exists', code = 409) {
        super(message, code)
    }
}

export class UnknownError extends HttpError {
    constructor(message = 'unknown error', code = 500) {
        super(message, code)
    }
}

export class AccessDeniedError extends HttpError {
    constructor(message = 'access denied', code = 403) {
        super(message, code)
    }
}

export function handleApiErrors(
    logger: Logger
): (err: unknown, req: Request, resp: Response, next: NextFunction) => unknown {
    return (err, _req, resp, next) => {
        console.log(err)
        if (err) {
            if (err instanceof HttpError) {
                logger.info(String(err))
                return resp.status(err.code).json({
                    error: err.message
                })
            } else if (String(err).includes('JSON at position')) {
                logger.info(String(err))
                resp.status(400).json({
                    error: 'invalid JSON'
                })
            } else {
                logger.error(String(err))
                return resp.status(500).json({
                    error: 'unknown error'
                })
            }
        }
        next(err)
    }
}
