"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const timers_1 = require("timers");
const path_1 = require("path");
const fs_1 = require("fs");
const util_1 = require("util");
const torrent_stream_1 = __importDefault(require("torrent-stream"));
const parse_torrent_1 = __importDefault(require("parse-torrent"));
class TorrentClient {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.onStartExecuted = false;
        this.torrents = {};
        this.interval = timers_1.setInterval(() => {
            this.periodCheck();
        }, 1000 * 10);
    }
    async addAndGet(link) {
        return new Promise((resolve) => {
            const info = parse_torrent_1.default(link);
            const hash = info.infoHash;
            if (!hash) {
                throw `Torrent hash not found for ${link}`;
            }
            if (hash in this.torrents) {
                const torrent = {
                    ...this.torrents[hash],
                    updated: Date.now()
                };
                this.torrents[hash] = torrent;
                resolve(torrent);
            }
            else {
                this.logger.info(`Add new torrent from ${link}`);
                const torrent = {
                    engine: torrent_stream_1.default(link, {
                        path: path_1.join(this.config.torrents.path, hash)
                    }),
                    infoHash: hash,
                    started: Date.now(),
                    updated: Date.now()
                };
                this.torrents[hash] = torrent;
                torrent.engine.on('ready', () => {
                    resolve(torrent);
                });
            }
        });
    }
    async periodCheck() {
        await this.onStart();
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
    async onStart() {
        if (!this.onStartExecuted) {
            this.logger.info('Preparing torrents directory');
            this.onStartExecuted = true;
            await util_1.promisify(fs_1.mkdir)(this.config.torrents.path, { recursive: true });
        }
    }
}
exports.TorrentClient = TorrentClient;
