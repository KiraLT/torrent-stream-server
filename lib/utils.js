"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
function merge(current, update) {
    current = { ...current };
    Object.keys(update).forEach(function (key) {
        if (current.hasOwnProperty(key)
            && typeof current[key] === 'object'
            && !(current[key] instanceof Array)) {
            merge(current[key], update[key]);
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
