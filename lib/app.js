"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const torrent_1 = require("./torrent");
const stream_1 = require("./api/stream");
const torrents_1 = require("./api/torrents");
const config_1 = require("./config");
const logging_1 = require("./logging");
function createApp(config) {
    const app = express_1.default();
    app.use(express_1.default.json());
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    return logging_1.setupAppLogger(app, config);
}
async function setup() {
    const config = await config_1.readConfig(process.argv[2]);
    const logger = logging_1.createLogger(config);
    logger.info('Starting app');
    const app = createApp(config);
    const client = new torrent_1.TorrentClient(config, logger);
    app.get('/status', (req, res) => res.send({ 'status': 'ok' }));
    torrents_1.setupTorrentsApi(app, config, logger, client);
    stream_1.setupStreamApi(app, config, logger, client);
    app.listen(config.port);
}
exports.setup = setup;
