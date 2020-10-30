"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMagnet = void 0;
function formatMagnet(infoHash, name, trackers) {
    const trackersQueryString = `&tr=${trackers.map(encodeURIComponent).join('&tr=')}`;
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}${trackersQueryString}`;
}
exports.formatMagnet = formatMagnet;
