"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const winston_1 = __importDefault(require("winston"));
const express_winston_1 = __importDefault(require("express-winston"));
const { Loggly } = require('winston-loggly-bulk');
const torrent_1 = require("./torrent");
const stream_1 = require("./api/stream");
const torrents_1 = require("./api/torrents");
const config_1 = require("./config");
const port = 3000;
function createApp(config) {
    const app = express_1.default();
    app.use(express_1.default.json());
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    if (config.logging && config.logging.transports) {
        app.use(express_winston_1.default.logger({
            transports: config.logging.transports.map(v => v.type === 'loggly' ? new Loggly({
                subdomain: v.subdomain,
                inputToken: v.token,
                json: true,
                tags: v.tags || []
            }) : new winston_1.default.transports.Console({}))
        }));
    }
    return app;
}
async function setup() {
    const config = await config_1.readConfig(process.argv[2]);
    const app = createApp(config);
    const client = new torrent_1.TorrentClient();
    app.get('/status', (req, res) => res.send('ok'));
    torrents_1.setupTorrentsApi(app, client);
    stream_1.setupStreamApi(app, client);
    app.listen(port, () => console.log(`Listening on port ${port}!`));
}
exports.setup = setup;
