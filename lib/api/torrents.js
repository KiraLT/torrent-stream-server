"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setupTorrentsApi(app, client) {
    app.get('/torrents', (req, res) => res.send(client.getAll().map(torrent => ({
        infoHash: torrent.infoHash,
        files: torrent.engine.files.map(file => ({
            name: file.name,
            path: file.path,
            length: file.length
        })),
        started: new Date(torrent.started).toISOString(),
        updated: new Date(torrent.updated).toISOString()
    }))));
}
exports.setupTorrentsApi = setupTorrentsApi;
