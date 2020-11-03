"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiErrors = void 0;
const http_errors_1 = require("http-errors");
function handleApiErrors(logger) {
    return (err, _req, resp, next) => {
        if (err) {
            if (err instanceof http_errors_1.HttpError) {
                logger.warn(`${err.statusCode} error: ${err.message}`);
                return resp.status(err.statusCode).json({
                    error: err.message,
                });
            }
            else if (String(err).includes('JSON at position')) {
                logger.warn(String(err));
                resp.status(400).json({
                    error: 'invalid JSON',
                });
            }
            else {
                logger.error(String(err));
                return resp.status(500).json({
                    error: 'unknown error',
                });
            }
        }
        next(err);
    };
}
exports.handleApiErrors = handleApiErrors;
