"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pump_1 = __importDefault(require("pump"));
const range_parser_1 = __importDefault(require("range-parser"));
function setupStreamApi(app, config, logger, client) {
    app.get('/stream', async (req, res) => {
        const link = req.query.torrent;
        if (!link) {
            return res.send(400);
        }
        let torrent;
        try {
            torrent = await client.addAndGet(link);
        }
        catch (error) {
            logger.warn(`Bad torrent: ${error}`);
            return res.sendStatus(400).send(String(error));
        }
        const file = torrent.engine.files.find(f => f.name === req.query.file) || torrent.engine.files[0];
        if (!file) {
            return res.send(400);
        }
        const parsedRange = req.headers.range ? range_parser_1.default(file.length, req.headers.range) : undefined;
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
