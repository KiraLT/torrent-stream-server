"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const readFilePromise = util_1.promisify(fs_1.readFile);
const defaultConfig = {};
async function readConfig(path) {
    try {
        return path ? JSON.parse(await util_1.promisify(fs_1.readFile)(path, { encoding: 'utf8' })) : defaultConfig;
    }
    catch (error) {
        throw Error(`Failed to read config from ${path} - ${error}`);
    }
}
exports.readConfig = readConfig;
