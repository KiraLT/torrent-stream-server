"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThepiratebayProvider = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const _1 = require(".");
const helpers_1 = require("../helpers");
const utils_1 = require("../../../utils");
class ThepiratebayProvider extends _1.Provider {
    constructor() {
        super(...arguments);
        this.trackers = [
            'udp://tracker.coppersurfer.tk:6969/announce',
            'udp://9.rarbg.to:2920/announce',
            'udp://tracker.opentrackr.org:1337',
            'udp://tracker.internetwarriors.net:1337/announce',
            'udp://tracker.leechers-paradise.org:6969/announce',
            'udp://tracker.pirateparty.gr:6969/announce',
            'udp://tracker.cyberia.is:6969/announce'
        ];
    }
    async getMeta() {
        return {
            categories: [
                {
                    "name": "Audio",
                    "id": "100",
                    "subcategories": [
                        {
                            "name": "Music",
                            "id": "101"
                        },
                        {
                            "name": "Audio books",
                            "id": "102"
                        },
                        {
                            "name": "Sound clips",
                            "id": "103"
                        },
                        {
                            "name": "FLAC",
                            "id": "103"
                        },
                        {
                            "name": "Other",
                            "id": "199"
                        }
                    ]
                },
                {
                    "name": "Video",
                    "id": "200",
                    "subcategories": [
                        {
                            "name": "Movies",
                            "id": "201"
                        },
                        {
                            "name": "Movies DVDR",
                            "id": "202"
                        },
                        {
                            "name": "Music videos",
                            "id": "203"
                        },
                        {
                            "name": "Movie clips",
                            "id": "204"
                        },
                        {
                            "name": "TV shows",
                            "id": "205"
                        },
                        {
                            "name": "Handheld",
                            "id": "206"
                        },
                        {
                            "name": "HD - Movies",
                            "id": "207"
                        },
                        {
                            "name": "HD - TV shows",
                            "id": "208"
                        },
                        {
                            "name": "3D",
                            "id": "209"
                        },
                        {
                            "name": "Other",
                            "id": "299"
                        }
                    ]
                },
                {
                    "name": "Applications",
                    "id": "300",
                    "subcategories": [
                        {
                            "name": "Windows",
                            "id": "301"
                        },
                        {
                            "name": "Mac",
                            "id": "302"
                        },
                        {
                            "name": "UNIX",
                            "id": "303"
                        },
                        {
                            "name": "Handheld",
                            "id": "304"
                        },
                        {
                            "name": "IOS (iPad/iPhone)",
                            "id": "305"
                        },
                        {
                            "name": "Android",
                            "id": "306"
                        },
                        {
                            "name": "Other OS",
                            "id": "399"
                        }
                    ]
                },
                {
                    "name": "Games",
                    "id": "400",
                    "subcategories": [
                        {
                            "name": "PC",
                            "id": "401"
                        },
                        {
                            "name": "Mac",
                            "id": "402"
                        },
                        {
                            "name": "PSx",
                            "id": "403"
                        },
                        {
                            "name": "XBOX360",
                            "id": "404"
                        },
                        {
                            "name": "Wii",
                            "id": "405"
                        },
                        {
                            "name": "Handheld",
                            "id": "406"
                        },
                        {
                            "name": "IOS (iPad/iPhone)",
                            "id": "407"
                        },
                        {
                            "name": "Android",
                            "id": "408"
                        },
                        {
                            "name": "Other",
                            "id": "499"
                        }
                    ]
                },
                {
                    "name": "Porn",
                    "id": "500",
                    "subcategories": [
                        {
                            "name": "Movies",
                            "id": "501"
                        },
                        {
                            "name": "Movies DVDR",
                            "id": "502"
                        },
                        {
                            "name": "Pictures",
                            "id": "503"
                        },
                        {
                            "name": "Games",
                            "id": "504"
                        },
                        {
                            "name": "HD - Movies",
                            "id": "505"
                        },
                        {
                            "name": "Movie clips",
                            "id": "506"
                        },
                        {
                            "name": "Other",
                            "id": "599"
                        }
                    ]
                },
                {
                    "name": "Other",
                    "id": "600",
                    "subcategories": [
                        {
                            "name": "E-books",
                            "id": "601"
                        },
                        {
                            "name": "Comics",
                            "id": "602"
                        },
                        {
                            "name": "Pictures",
                            "id": "603"
                        },
                        {
                            "name": "Covers",
                            "id": "604"
                        },
                        {
                            "name": "Physibles",
                            "id": "605"
                        },
                        {
                            "name": "Other",
                            "id": "699"
                        }
                    ]
                }
            ],
            features: [
                _1.ProviderFeatures.SEARCH
            ]
        };
    }
    async search(query, options) {
        const { category, limit } = options || {};
        const url = `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=${encodeURIComponent(category || '')}`;
        const response = await node_fetch_1.default(url);
        if (!response.ok) {
            throw new Error('Failed to load results');
        }
        const result = await response.json();
        return result.map(v => ({
            name: v.name,
            magnet: helpers_1.formatMagnet(v.info_hash, v.name, this.trackers),
            seeds: parseInt(v.seeders, 10),
            peers: parseInt(v.leechers, 10),
            size: utils_1.formatBytes(parseInt(v.size, 10)),
            time: new Date(v.added).toString()
        }));
    }
}
exports.ThepiratebayProvider = ThepiratebayProvider;
ThepiratebayProvider.providerName = 'ThePirateBay';
