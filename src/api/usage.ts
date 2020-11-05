import { Express } from 'express'
import { Logger } from 'winston'
import checkDiskSpace from 'check-disk-space'

import { Config } from '../config'
import { getUsedSpace } from '../helpers'
import { Usage } from '../models'

export function setupUsageApi(app: Express, config: Config, _logger: Logger): Express {
    app.get<{}, Usage, {}, {}>('/api/usage', async (_req, res) => {
        const space = await checkDiskSpace(config.torrents.path)
        const usedSpace = await getUsedSpace(config.torrents.path)

        res.json({
            totalDiskSpace: space.size,
            freeDiskSpace: space.free,
            usedTorrentSpace: usedSpace,
        })
    })

    return app
}
