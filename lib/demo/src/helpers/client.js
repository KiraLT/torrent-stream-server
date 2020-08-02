"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsage = exports.getSteamUrl = exports.getTorrents = exports.createTorrent = void 0;
const apiDomain = process.env.NODE_ENV === 'production' ? `${window.location.protocol}//${window.location.host}` : 'http://127.0.0.1:3000';
const apiUrl = `${apiDomain}/api`;
const streamUrl = `${apiDomain}/stream`;
async function createTorrent({ link }) {
    return fetch(`${apiUrl}/torrents?torrent=${link}`, {
        method: 'POST'
    }).then(v => v.json());
}
exports.createTorrent = createTorrent;
async function getTorrents() {
    return fetch(`${apiUrl}/torrents`).then(v => v.json());
}
exports.getTorrents = getTorrents;
function getSteamUrl(link, file) {
    return `${streamUrl}?torrent=${encodeURIComponent(link)}&file=${encodeURIComponent(file)}`;
}
exports.getSteamUrl = getSteamUrl;
async function getUsage() {
    return fetch(`${apiUrl}/usage`).then(v => v.json());
}
exports.getUsage = getUsage;
