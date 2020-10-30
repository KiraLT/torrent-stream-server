"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBrowseApi = void 0;
const torrent_search_1 = require("../helpers/torrent-search");
function setupBrowseApi(app, _config, _logger, _client) {
    app.get('/api/browse/search', async (req, res) => {
        const query = req.query.q;
        const category = req.query.c;
        const provider = req.query.p;
        if (typeof query !== 'string' || typeof category !== 'string' || !torrent_search_1.isProviderSupported(provider)) {
            return res.json([]);
        }
        const result = await torrent_search_1.search([provider], query, {
            category: category,
            limit: 50
        });
        return res.json(result);
    });
    app.get('/api/browse/providers', async (_req, res) => {
        return res.json(await torrent_search_1.getProvidersInfo());
    });
    return app;
}
exports.setupBrowseApi = setupBrowseApi;
