"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUsageApi = void 0;
const check_disk_space_1 = __importDefault(require("check-disk-space"));
const helpers_1 = require("../helpers");
function setupUsageApi(app, config, _logger, _client) {
    app.get('/api/usage', async (_req, res) => {
        const space = await check_disk_space_1.default(config.torrents.path);
        const usedSpace = await helpers_1.getUsedSpace(config.torrents.path);
        res.json({
            totalDiskSpace: space.size,
            freeDiskSpace: space.free,
            usedTorrentSpace: usedSpace,
        });
    });
    return app;
}
exports.setupUsageApi = setupUsageApi;
