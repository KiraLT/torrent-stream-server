"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X1337Provider = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = require("cheerio");
const _1 = require(".");
class X1337Provider extends _1.Provider {
    constructor() {
        super(...arguments);
        this.trackers = [
            'udp://tracker.coppersurfer.tk:6969/announce',
            'udp://9.rarbg.to:2920/announce',
            'udp://tracker.opentrackr.org:1337',
            'udp://tracker.internetwarriors.net:1337/announce',
            'udp://tracker.leechers-paradise.org:6969/announce',
            'udp://tracker.pirateparty.gr:6969/announce',
            'udp://tracker.cyberia.is:6969/announce',
        ];
    }
    async getMeta() {
        return {
            categories: [
                {
                    name: 'Movies',
                    id: 'Movies',
                    subcategories: [],
                },
                {
                    name: 'TV',
                    id: 'TV',
                    subcategories: [],
                },
                {
                    name: 'Games',
                    id: 'Games',
                    subcategories: [],
                },
                {
                    name: 'Anime',
                    id: 'Anime',
                    subcategories: [],
                },
                {
                    name: 'Apps',
                    id: 'Apps',
                    subcategories: [],
                },
                {
                    name: 'Documentaries',
                    id: 'Documentaries',
                    subcategories: [],
                },
                {
                    name: 'XXX',
                    id: 'XXX',
                    subcategories: [],
                },
                {
                    name: 'Other',
                    id: 'Other',
                    subcategories: [],
                },
            ],
            features: [_1.ProviderFeature.Search],
        };
    }
    async search(query, options) {
        const { category, limit } = options || {};
        const domain = 'http://www.1337x.to';
        const url = category
            ? `${domain}/category-search/${encodeURIComponent(query)}/${encodeURIComponent(category || '')}/1`
            : `${domain}/search/${encodeURIComponent(query)}/1/`;
        const response = await node_fetch_1.default(url, {
            headers: {
                'User-Agent': `torrent-stream-server (+https://github.com/KiraLT/torrent-stream-server)`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to load results');
        }
        const $ = cheerio_1.load(await response.text());
        const categories = (await this.getMeta()).categories.flatMap((v) => [
            ...v.subcategories,
            {
                id: v.id,
                name: v.name,
            },
        ]);
        return $('tbody > tr')
            .get()
            .map((v) => {
            const el = $(v);
            const id = (el.find('a:nth-child(2)').attr('href') || '').trim();
            return {
                name: el.find('a').text().trim(),
                magnet: '',
                seeds: parseInt(el.find('.seeds').text().trim(), 10) || 0,
                peers: parseInt(el.find('.leeches').text().trim(), 10) || 0,
                size: '',
                time: 0,
                category: categories.find((c) => c.id === v.sub_category) || {
                    name: 'All',
                    id: '',
                },
                link: '',
            };
        });
    }
}
exports.X1337Provider = X1337Provider;
X1337Provider.providerName = '1337x';
