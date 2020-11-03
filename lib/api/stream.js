"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStreamApi = void 0;
const pump_1 = __importDefault(require("pump"));
const range_parser_1 = __importDefault(require("range-parser"));
const mime_types_1 = require("mime-types");
const http_errors_1 = require("http-errors");
const utils_1 = require("../utils");
const helpers_1 = require("../helpers");
function setupStreamApi(app, config, logger, client) {
    app.get('/stream', async (req, res) => {
        const data = config.security.streamApi
            ? utils_1.verifyJwrRoken(String(req.query.token), config.security.streamApi.key, config.security.streamApi.maxAge)
            : req.query;
        if (!data) {
            throw new http_errors_1.Forbidden();
        }
        const link = helpers_1.validateString(data.torrent, 'torrent');
        const fileName = helpers_1.validateString(data.file, 'file');
        if (!link) {
            return res.send(400);
        }
        let torrent;
        try {
            torrent = await client.addAndGet(link);
        }
        catch (error) {
            return new http_errors_1.BadRequest(String(error));
        }
        const file = torrent.files.find((f) => f.path === fileName) ||
            torrent.files.find((f) => f.name === fileName) ||
            torrent.files[0];
        if (!file) {
            return new http_errors_1.NotFound();
        }
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        res.setHeader('Content-Type', mime_types_1.lookup(file.name) || 'application/octet-stream');
        const parsedRange = req.headers.range
            ? range_parser_1.default(file.length, req.headers.range)
            : undefined;
        const range = parsedRange instanceof Array ? parsedRange[0] : undefined;
        res.setHeader('Accept-Ranges', 'bytes');
        res.type(file.name);
        req.connection.setTimeout(3600000);
        if (!range) {
            res.setHeader('Content-Length', file.length);
            if (req.method === 'HEAD') {
                return res.end();
            }
            return pump_1.default(file.createReadStream(), res);
        }
        res.statusCode = 206;
        res.setHeader('Content-Length', range.end - range.start + 1);
        res.setHeader('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + file.length);
        if (req.method === 'HEAD') {
            return res.end();
        }
        return pump_1.default(file.createReadStream(range), res);
    });
    return app;
}
exports.setupStreamApi = setupStreamApi;
