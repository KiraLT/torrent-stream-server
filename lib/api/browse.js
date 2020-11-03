"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBrowseApi = void 0;
const http_errors_1 = require("http-errors");
const torrent_search_1 = require("../helpers/torrent-search");
const helpers_1 = require("../helpers");
function setupBrowseApi(app, _config, _logger, _client) {
    app.get('/api/browse/search', async (req, res) => {
        const query = helpers_1.validateString(req.query.query, 'query');
        const category = req.query.category
            ? helpers_1.validateString(req.query.category, 'category')
            : undefined;
        const provider = helpers_1.validateString(req.query.provider, 'provider');
        if (!torrent_search_1.isProviderSupported(provider)) {
            throw new http_errors_1.BadRequest(`Provider ${provider} is not supported`);
        }
        return res.json(await torrent_search_1.search([provider], query, {
            category: category,
            limit: 50,
        }));
    });
    app.get('/api/browse/providers', async (_req, res) => {
        return res.json(await torrent_search_1.getProvidersInfo());
    });
    return app;
}
exports.setupBrowseApi = setupBrowseApi;
