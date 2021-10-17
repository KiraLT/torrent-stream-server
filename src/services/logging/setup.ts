import winston, { Logger } from 'winston'
import Transport from 'winston-transport'

import { Config } from '../../config'
import { LogsStorage } from './storage'

const { Loggly } = require('winston-loggly-bulk')

export function createLogger(config: Config, storage: LogsStorage): Logger {
    return winston.createLogger(getLoggerParams(config, storage))
}

const getLoggerParams = (config: Config, storage: LogsStorage) => ({
    transports: [
        ...config.logging.transports.map((v) =>
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
                    format: winston.format.simple()
                })
        ),
        new LogsStorageTransport({}, storage)
    ],
    level: config.logging.level,
})

class LogsStorageTransport extends Transport {
    constructor(opts: Transport.TransportStreamOptions, protected storage: LogsStorage) {
        super(opts)
    }

    log(info: {message?: string, level?: string}, next: () => void) {
        const mappings = {
            emerg: 'error', 
            alert: 'error', 
            crit: 'error', 
            error: 'error', 
            warning: 'warn', 
            warn: 'warn', 
            notice: 'info', 
            info: 'info', 
            debug: 'debug'
        } as const
        if (info.message && info.level) {
            this.storage.add({
                message: info.message,
                level: mappings[info.level as keyof typeof mappings] || 'error',
                time: Date.now() / 1000
            })
        }
        next()
    }
}