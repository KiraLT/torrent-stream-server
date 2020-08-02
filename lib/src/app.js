"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const fs_1 = require("fs");
const torrent_1 = require("./torrent");
const stream_1 = require("./api/stream");
const torrents_1 = require("./api/torrents");
const config_1 = require("./config");
const logging_1 = require("./logging");
const usage_1 = require("./api/usage");
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
    logger.info(`Starting app on http://127.0.0.1:${config.port}`);
    const app = createApp(config);
    const client = await torrent_1.TorrentClient.create(config, logger);
    app.get('/api/status', (req, res) => res.send({ 'status': 'ok' }));
    if (!config.security.streamApi || (config.security.streamApi && config.security.apiKey)) {
        console.log(config.security.apiKey);
        if (config.security.apiKey) {
            app.use('/api/', (req, res, next) => {
                const [type, token] = (req.headers.authorization || '').split(' ');
                if (type === 'bearer' && token === config.security.apiKey) {
                    next();
                }
                else {
                    res.status(403).send({
                        'error': 'Incorect authorization header'
                    });
                }
            });
        }
        torrents_1.setupTorrentsApi(app, config, logger, client);
        stream_1.setupStreamApi(app, config, logger, client);
        usage_1.setupUsageApi(app, config, logger, client);
    }
    if (config.security.demoEnabled) {
        const path = path_1.resolve(__dirname, '../demo/build');
        app.use((req, res, next) => {
            var file = path + req.path;
            fs_1.exists(file, (fileExists) => {
                if (fileExists) {
                    res.sendFile(file);
                }
                else {
                    next();
                }
            });
        });
        app.get('/', (req, res) => res.sendFile(path_1.join(path, 'index.html')));
        app.get('/play', (req, res) => res.sendFile(path_1.join(path, 'index.html')));
        app.get('/dashboard', (req, res) => res.sendFile(path_1.join(path, 'index.html')));
    }
    app.listen(config.port);
}
exports.setup = setup;
