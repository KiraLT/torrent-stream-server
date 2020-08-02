"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUsageApi = void 0;
const check_disk_space_1 = __importDefault(require("check-disk-space"));
const trammel = require('trammel');
function setupUsageApi(app, config, logger, client) {
    app.get('/api/usage', async (req, res) => {
        const space = await check_disk_space_1.default(config.torrents.path);
        const usedSpace = await trammel(config.torrents.path, { type: 'raw' });
        res.send({
            totalDiskSpace: space.size,
            freeDiskSpace: space.free,
            usedTorrentSpace: usedSpace,
        });
    });
    return app;
}
exports.setupUsageApi = setupUsageApi;
