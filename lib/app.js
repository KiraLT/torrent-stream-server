"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const torrent_1 = require("./torrent");
const stream_1 = require("./api/stream");
const torrents_1 = require("./api/torrents");
const port = 3000;
function createApp() {
    const app = express_1.default();
    app.use(express_1.default.json());
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    return app;
}
function setup() {
    const app = createApp();
    const client = new torrent_1.TorrentClient();
    app.get('/status', (req, res) => res.send('ok'));
    torrents_1.setupTorrentsApi(app, client);
    stream_1.setupStreamApi(app, client);
    app.listen(port, () => console.log(`Listening on port ${port}!`));
}
exports.setup = setup;
