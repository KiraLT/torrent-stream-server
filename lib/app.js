"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const fs_1 = require("fs");
const cors_1 = __importDefault(require("cors"));
const torrent_1 = require("./torrent");
const stream_1 = require("./api/stream");
const torrents_1 = require("./api/torrents");
const config_1 = require("./config");
const logging_1 = require("./logging");
const usage_1 = require("./api/usage");
const errors_1 = require("./errors");
const browse_1 = require("./api/browse");
require("express-async-errors");
function createApp(config, logger) {
    const app = express_1.default();
    app.use(cors_1.default());
    app.use(express_1.default.json());
    if (config.trustProxy) {
        logger.info('Enabling proxy support');
        app.set('trust proxy', true);
    }
    return app;
}
async function setup() {
    const config = await config_1.readConfig(process.argv[2]);
    const logger = logging_1.createLogger(config);
    const app = createApp(config, logger);
    const client = await torrent_1.TorrentClient.create(config, logger);
    app.get('/status', (_req, res) => res.send({ 'status': 'ok' }));
    if (!config.security.streamApi || (config.security.streamApi && config.security.apiKey)) {
        if (config.security.apiKey) {
            app.use('/api/', (req, res, next) => {
                const [type, token] = (req.headers.authorization || '').split(' ');
                if (type.toLowerCase() === 'bearer' && token === config.security.apiKey) {
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
        browse_1.setupBrowseApi(app, config, logger, client);
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
    app.use(errors_1.handleApiErrors(logger));
    app.listen(config.port, config.host, () => {
        logger.info(`Listening app ${config.host}:${config.port}`);
    });
}
exports.setup = setup;
