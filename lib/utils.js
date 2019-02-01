"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
