"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiErrors = exports.AccessDeniedError = exports.UnknownError = exports.AlreadyExistsError = exports.NotFoundError = exports.ValidationError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, code = 200) {
        super(message);
        this.code = code;
    }
}
exports.HttpError = HttpError;
class ValidationError extends HttpError {
    constructor(message, code = 400) {
        super(message, code);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends HttpError {
    constructor(message = 'resource not found', code = 404) {
        super(message, code);
    }
}
exports.NotFoundError = NotFoundError;
class AlreadyExistsError extends HttpError {
    constructor(message = 'resource already exists', code = 409) {
        super(message, code);
    }
}
exports.AlreadyExistsError = AlreadyExistsError;
class UnknownError extends HttpError {
    constructor(message = 'unknown error', code = 500) {
        super(message, code);
    }
}
exports.UnknownError = UnknownError;
class AccessDeniedError extends HttpError {
    constructor(message = 'access denied', code = 403) {
        super(message, code);
    }
}
exports.AccessDeniedError = AccessDeniedError;
function handleApiErrors(logger) {
    return (err, _req, resp, next) => {
        console.log(err);
        if (err) {
            if (err instanceof HttpError) {
                logger.info(String(err));
                return resp.status(err.code).json({
                    error: err.message
                });
            }
            else if (String(err).includes('JSON at position')) {
                logger.info(String(err));
                resp.status(400).json({
                    error: 'invalid JSON'
                });
            }
            else {
                logger.error(String(err));
                return resp.status(500).json({
                    error: 'unknown error'
                });
            }
        }
        next(err);
    };
}
exports.handleApiErrors = handleApiErrors;
