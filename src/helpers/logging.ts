import { Express } from 'express'
import winston, { Logger } from 'winston'
import expressWinston from 'express-winston'
const { Loggly } = require('winston-loggly-bulk')

import { Config } from '../config'

export function createLogger(config: Config): Logger {
    return winston.createLogger(getLoggerParams(config))
}

export function setupAppLogger(app: Express, config: Config): Express {
    if (config.logging) {
        app.use(expressWinston.logger(getLoggerParams(config)))
    }
    return app
}

const getLoggerParams = (config: Config) => ({
    transports: config.logging.transports.map((v) =>
        v.type === 'loggly'
            ? new Loggly({
                  subdomain: v.subdomain,
                  inputToken: v.token,
                  json: true,
                  tags: v.tags || [],
                  handleExceptions: true,
              })
            : new winston.transports.Console({
                  handleExceptions: true,
              })
    ),
    level: config.logging.level,
})
