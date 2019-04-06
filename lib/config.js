"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const utils_1 = require("./utils");
const defaultConfig = {
    port: 3000,
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
        streamApi: {
            key: 'pZYwTNtSW1nCx7sIjpzDfG4AmkvpsAes',
            maxAge: '5h'
        }
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
