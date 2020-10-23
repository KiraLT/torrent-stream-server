"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBrowseApi = void 0;
const torrent_search_api_1 = require("torrent-search-api");
const nyaapi_1 = require("nyaapi");
class NyaaProvider {
    constructor() {
        this.name = 'Nyaa';
        this.categories = {
            'Anime': '0_0',
            'Anime - AMV': '1_1',
            'Anime - English': '1_2',
            'Anime - Non-English': '1_3',
            'Anime - Raws': '1_4',
            'Audio': '2_0',
            'Audio - Lossless': '2_1',
            'Audio - Lossy': '2_2',
            'Literature': '3_0',
            'Literature - English': '3_1',
            'Literature - Non-English': '3_2',
            'Literature - Raws': '3_3',
            'Live Action': '4_0',
            'Live Action - English': '4_1',
            'Live Action - Idol/PV': '4_2',
            'Live Action - Non-English': '4_3',
            'Live Action - Raws': '4_4',
            'Pictures': '5_0',
            'Pictures - Graphics': '5_0',
            'Pictures - Photos': '5_2',
            'Software': '6_0',
            'Software - Apps': '6_1',
            'Software - Games': '6_1',
        };
        this.isActive = false;
    }
    async search(query, category, limit) {
        const result = await nyaapi_1.si.search(query, limit, category in this.categories ? {
            category: this.categories[category]
        } : undefined);
        return result.map(v => ({
            title: v.name,
            magnet: v.magnet,
            seeds: parseInt(v.seeders, 10) || 0,
            peers: parseInt(v.leechers, 10) || 0,
            size: v.filesize,
            provider: this.name,
            desc: '',
            time: v.date,
            downloads: parseInt(v.completed, 10) || 0
        }));
    }
    getCategories() {
        return Object.keys(this.categories);
    }
    getInformations() {
        return {
            name: this.name,
            categories: this.getCategories()
        };
    }
    enableProvider() {
        this.isActive = true;
    }
}
function setupBrowseApi(app, _config, _logger, _client) {
    torrent_search_api_1.addProvider(new NyaaProvider());
    torrent_search_api_1.enableProvider('Nyaa');
    torrent_search_api_1.enablePublicProviders();
    app.get('/api/browse/search/:provider', async (req, res) => {
        const query = req.query.q;
        const category = req.query.c;
        const provider = req.params.provider;
        if (typeof query !== 'string' || typeof category !== 'string' || typeof provider !== 'string') {
            return res.json([]);
        }
        const result = await torrent_search_api_1.search([provider], query, category, 100);
        return res.json(result.map(v => ({
            name: v.title,
            magnet: v.magnet,
            peers: v.peers || 0,
            seeds: v.seeds || 0,
            size: v.size,
            downloads: v.downloads,
            time: v.time
        })));
    });
    app.get('/api/browse/providers', async (_req, res) => {
        return res.json(torrent_search_api_1.getActiveProviders().map(v => ({
            name: v.name,
            categories: v.categories,
        })));
    });
    return app;
}
exports.setupBrowseApi = setupBrowseApi;
