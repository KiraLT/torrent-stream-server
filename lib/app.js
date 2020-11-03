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
const yamljs_1 = __importDefault(require("yamljs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const http_errors_1 = require("http-errors");
const torrent_1 = require("./torrent");
const stream_1 = require("./api/stream");
const torrents_1 = require("./api/torrents");
const config_1 = require("./config");
const logging_1 = require("./logging");
const usage_1 = require("./api/usage");
const errors_1 = require("./errors");
const browse_1 = require("./api/browse");
const auth_1 = require("./api/auth");
require("express-async-errors");
function createApp(config, logger) {
    logger.info(`Starting app in ${config.environment} environment`);
    const app = express_1.default();
    app.use(cors_1.default());
    app.use(express_1.default.json());
    if (config.environment === 'development') {
        const swaggerDocument = yamljs_1.default.load(path_1.resolve(__dirname, 'swagger.yaml'));
        app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    }
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
    app.get('/status', (_req, res) => res.send({ status: 'ok' }));
    if (config.security.apiEnabled) {
        if (config.security.apiKey || config.security.streamApi) {
            logger.info('Enabled API security');
            app.use('/api/', (req, _res, next) => {
                const [type, token] = (req.headers.authorization || '').split(' ');
                const correctKey = config.security.apiKey ||
                    (config.security.streamApi && config.security.streamApi.key);
                if (type === '') {
                    throw new http_errors_1.Unauthorized();
                }
                if (type.toLowerCase() === 'bearer' && correctKey && token === correctKey) {
                    next();
                }
                else {
                    throw new http_errors_1.Forbidden();
                }
            });
        }
        torrents_1.setupTorrentsApi(app, config, logger, client);
        stream_1.setupStreamApi(app, config, logger, client);
        usage_1.setupUsageApi(app, config, logger, client);
        browse_1.setupBrowseApi(app, config, logger, client);
        auth_1.setupAuthApi(app, config, logger, client);
        app.use('/api/?*', () => {
            throw new http_errors_1.NotFound();
        });
    }
    else {
        logger.info('API is disabled according to the config');
    }
    app.use(errors_1.handleApiErrors(logger));
    if (config.security.frontendEnabled) {
        if (config.environment === 'production') {
            logger.info('Serving frontend files');
            const path = path_1.resolve(__dirname, '../frontend/build');
            app.use((req, res) => {
                var file = path + req.path;
                fs_1.exists(file, (fileExists) => {
                    if (fileExists) {
                        res.sendFile(file);
                    }
                    else {
                        res.sendFile(path_1.join(path, 'index.html'));
                    }
                });
            });
        }
    }
    app.listen(config.port, config.host, () => {
        logger.info(`Listening on ${config.host}:${config.port}`);
        if (config.environment === 'development') {
            logger.info(`* Website on http://127.0.0.1:${config.port}`);
            logger.info(`* Docs on http://127.0.0.1:${config.port}/api-docs`);
        }
    });
}
exports.setup = setup;
