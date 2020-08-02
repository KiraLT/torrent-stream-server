"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBytes = exports.verifyJwrRoken = exports.signJwtToken = exports.merge = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
function merge(current, update) {
    current = { ...current };
    Object.keys(update).forEach(function (key) {
        if (current.hasOwnProperty(key)
            && typeof current[key] === 'object'
            && !(current[key] instanceof Array)) {
            current[key] = merge(current[key], update[key]);
        }
        else {
            current[key] = update[key];
        }
    });
    return current;
}
exports.merge = merge;
function signJwtToken(data, key) {
    return jsonwebtoken_1.sign(data, key);
}
exports.signJwtToken = signJwtToken;
function verifyJwrRoken(token, key, maxAge) {
    try {
        return jsonwebtoken_1.verify(token, key, {
            maxAge
        });
    }
    catch (error) {
        console.log(error);
        return undefined;
    }
}
exports.verifyJwrRoken = verifyJwrRoken;
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
exports.formatBytes = formatBytes;
