"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTorrentsApi = void 0;
const http_errors_1 = require("http-errors");
const helpers_1 = require("../helpers");
function setupTorrentsApi(app, _config, _logger, client) {
    app.post('/api/torrents', async (req, res) => {
        const link = helpers_1.validateString(req.query.torrent, 'torrent');
        const torrent = await client.addAndGet(link);
        res.json(torrent.getMeta());
    });
    app.get('/api/torrents', (_req, res) => {
        return res.json(client.getAll().map((v) => v.getMeta()));
    });
    app.get('/api/torrents/:id', (req, res) => {
        const torrent = client.get(helpers_1.validateString(req.params.id, 'id'));
        if (torrent) {
            return res.json(torrent.getMeta());
        }
        throw new http_errors_1.NotFound();
    });
    return app;
}
exports.setupTorrentsApi = setupTorrentsApi;
