"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const torrent_stream_1 = __importDefault(require("torrent-stream"));
const parse_torrent_1 = __importDefault(require("parse-torrent"));
const timers_1 = require("timers");
class TorrentClient {
    constructor() {
        this.torrents = {};
        this.interval = timers_1.setInterval(() => {
            this.periodCheck();
        }, 1000 * 10);
    }
    async addAndGet(link) {
        return new Promise((resolve) => {
            const info = parse_torrent_1.default(link);
            if (info.infoHash in this.torrents) {
                const torrent = {
                    ...this.torrents[info.infoHash],
                    updated: Date.now()
                };
                this.torrents[info.infoHash] = torrent;
                resolve(torrent);
            }
            else {
                const torrent = {
                    engine: torrent_stream_1.default(link),
                    infoHash: info.infoHash,
                    started: Date.now(),
                    updated: Date.now()
                };
                this.torrents[info.infoHash] = torrent;
                torrent.engine.on('ready', () => {
                    resolve(torrent);
                });
            }
        });
    }
    periodCheck() {
        this.getAll().forEach(torrent => {
            if (Date.now() - torrent.updated > 60 * 60 * 24) {
                torrent.engine.remove(false, () => {
                    torrent.engine.destroy(() => {
                        //
                    });
                });
            }
        });
    }
    getAll() {
        return Object.values(this.torrents);
    }
    stop() {
        timers_1.clearInterval(this.interval);
    }
}
exports.TorrentClient = TorrentClient;
