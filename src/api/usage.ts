import { Express } from 'express'
import { Logger } from 'winston'
import checkDiskSpace from 'check-disk-space'
const trammel = require('trammel')

import { TorrentClient } from '../torrent'
import { Config } from '../config'

export function setupUsageApi(app: Express, config: Config, logger: Logger, client: TorrentClient): Express {
    app.get('/api/usage', async (req, res) => {
        const space = await checkDiskSpace(config.torrents.path)
        const usedSpace = await trammel(config.torrents.path, {type: 'raw'})
        res.send({
            totalDiskSpace: space.size,
            freeDiskSpace: space.free,
            usedTorrentSpace: usedSpace,
        })
    })
    return app
}
