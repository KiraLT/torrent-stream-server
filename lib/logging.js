"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const express_winston_1 = __importDefault(require("express-winston"));
const { Loggly } = require('winston-loggly-bulk');
function createLogger(config) {
    return winston_1.default.createLogger(getLoggerParams(config));
}
exports.createLogger = createLogger;
function setupAppLogger(app, config) {
    if (config.logging) {
        app.use(express_winston_1.default.logger(getLoggerParams(config)));
    }
    return app;
}
exports.setupAppLogger = setupAppLogger;
const getLoggerParams = (config) => ({
    transports: config.logging.transports.map(v => v.type === 'loggly' ? new Loggly({
        subdomain: v.subdomain,
        inputToken: v.token,
        json: true,
        tags: v.tags || [],
        handleExceptions: true
    }) : new winston_1.default.transports.Console({
        handleExceptions: true
    })),
    level: config.logging.level
});
