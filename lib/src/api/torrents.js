"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTorrentsApi = void 0;
function setupTorrentsApi(app, config, logger, client) {
    app.post('/api/torrents', async (req, res) => {
        const link = req.query.torrent;
        if (!(typeof link === 'string')) {
            return res.send(400);
        }
        const torrent = await client.addAndGet(link);
        res.send(torrent.getMeta());
    });
    app.get('/api/torrents', (req, res) => res.send(client.getAll().map(v => v.getMeta())));
    app.get('/api/torrents/:id', (req, res) => {
        const torrent = client.get(req.params.id);
        if (torrent) {
            res.send(torrent.getMeta());
        }
        else {
            res.send(404);
        }
    });
    return app;
}
exports.setupTorrentsApi = setupTorrentsApi;
