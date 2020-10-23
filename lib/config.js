"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = exports.isInHeroku = exports.isInGoogleAppEngine = void 0;
const fs_1 = require("fs");
const util_1 = require("util");
const utils_1 = require("./utils");
// Trust proxy by default if running in GoogleAppEngine
exports.isInGoogleAppEngine = process.env.GAE_APPLICATION ? true : false;
exports.isInHeroku = process.env._ ? process.env._.toLowerCase().includes('heroku') : false;
const defaultConfig = {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '') || 3000,
    trustProxy: (process.env.TRUST_PROXY || '').toLowerCase() === 'true' ? true : exports.isInGoogleAppEngine || exports.isInHeroku,
    logging: {
        transports: [
            {
                type: 'console'
            }
        ],
        level: 'info'
    },
    torrents: {
        path: '/tmp/torrent-stream-server',
        autocleanInternal: 60 * 60
    },
    security: {
        streamApi: undefined,
        apiKey: undefined,
        demoEnabled: true
    }
};
async function readConfig(path) {
    try {
        return path ? mergeConfig(JSON.parse(await util_1.promisify(fs_1.readFile)(path, { encoding: 'utf8' }))) : defaultConfig;
    }
    catch (error) {
        throw Error(`Failed to read config from ${path} - ${error}`);
    }
}
exports.readConfig = readConfig;
function mergeConfig(config) {
    return utils_1.merge(defaultConfig, config);
}
