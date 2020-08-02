"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TorrentClient = void 0;
const timers_1 = require("timers");
const fs_1 = require("fs");
const util_1 = require("util");
const torrent_stream_1 = __importDefault(require("torrent-stream"));
const parse_torrent_1 = __importDefault(require("parse-torrent"));
class TorrentClient {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.torrents = {};
        this.interval = timers_1.setInterval(() => {
            this.periodCheck();
        }, 1000 * 10);
    }
    static async create(config, logger) {
        const client = new TorrentClient(config, logger);
        logger.info(`Preparing torrent directory - ${config.torrents.path}`);
        await util_1.promisify(fs_1.mkdir)(config.torrents.path, { recursive: true });
        return client;
    }
    async addAndGet(link) {
        return new Promise((resolve) => {
            const info = parse_torrent_1.default(link);
            const hash = info.infoHash;
            if (!hash) {
                throw `Torrent hash not found for ${link}`;
            }
            const torrent = this.get(hash);
            if (torrent) {
                this.update(hash, {
                    ...torrent,
                    updated: Date.now()
                });
                resolve(this.get(hash));
            }
            else {
                this.logger.info(`Add new torrent from ${link}`);
                const engine = torrent_stream_1.default(link, {
                    tmp: this.config.torrents.path
                });
                engine.on('ready', () => {
                    const torrent = {
                        link,
                        engine,
                        name: engine.torrent.name,
                        infoHash: hash,
                        files: engine.files,
                        started: Date.now(),
                        updated: Date.now(),
                    };
                    this.update(hash, {
                        ...torrent,
                        getMeta: () => ({
                            link: torrent.link,
                            infoHash: torrent.infoHash,
                            name: torrent.name,
                            files: torrent.files.map(v => ({
                                name: v.name,
                                length: v.length,
                                path: v.path
                            })),
                            started: torrent.started,
                            updated: torrent.updated,
                            downloadSpeed: engine.swarm.downloadSpeed(),
                            downloaded: engine.swarm.downloaded
                        })
                    });
                    resolve(this.get(hash));
                });
            }
        });
    }
    async periodCheck() {
        const torrentToRemove = this.getAll().filter(torrent => Date.now() - torrent.updated > this.config.torrents.autocleanInternal * 1000);
        await Promise.all(torrentToRemove.map(torrent => this.remove(torrent.infoHash)));
    }
    getAll() {
        return Object.values(this.torrents);
    }
    remove(infoHash) {
        const torrent = this.torrents[infoHash];
        if (torrent) {
            this.logger.info(`Removing expired torrent - ${torrent.infoHash}`);
            torrent.engine.remove(false, () => {
                torrent.engine.destroy(() => {
                    delete this.torrents[infoHash];
                    this.logger.info(`Torrent removed - ${torrent.infoHash}`);
                });
            });
        }
    }
    get(infoHash) {
        return this.torrents[infoHash];
    }
    has(infoHash) {
        return infoHash in this.torrents;
    }
    update(infoHash, torrent) {
        this.torrents[infoHash] = torrent;
    }
    stop() {
        timers_1.clearInterval(this.interval);
    }
}
exports.TorrentClient = TorrentClient;
