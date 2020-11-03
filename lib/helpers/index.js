"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSteamUrl = exports.validateString = exports.getUsedSpace = exports.mapValues = exports.exists = void 0;
const http_errors_1 = require("http-errors");
const trammel = require('trammel');
function exists(json, key) {
    const value = json[key];
    return value !== null && value !== undefined;
}
exports.exists = exists;
function mapValues(data, fn) {
    return Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: fn(data[key]) }), {});
}
exports.mapValues = mapValues;
async function getUsedSpace(path) {
    return await trammel(path, { type: 'raw' });
}
exports.getUsedSpace = getUsedSpace;
function validateString(value, name) {
    if (value == null || !value) {
        throw new http_errors_1.BadRequest(`${name} is required`);
    }
    if (typeof value === 'string') {
        return value;
    }
    throw new http_errors_1.BadRequest(`${name} must be string`);
}
exports.validateString = validateString;
function getSteamUrl(link, file) {
    return `/stream?torrent=${encodeURIComponent(link)}&file=${encodeURIComponent(file)}`;
}
exports.getSteamUrl = getSteamUrl;
