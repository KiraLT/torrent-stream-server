import { Router } from 'express'
import { Logger } from 'winston'

import { Config } from '../config'
import { Usage } from '../models'
import { getUsedSpace, checkDiskSpace } from '../helpers/usage'

export function getUsageRouter(config: Config, _logger: Logger): Router {
    return Router().get<{}, Usage, {}, {}>('/usage', async (_req, res) => {
        const space = await checkDiskSpace(config.torrents.path)
        const usedSpace = await getUsedSpace(config.torrents.path)

        res.json({
            totalDiskSpace: space.size,
            freeDiskSpace: space.free,
            usedTorrentSpace: usedSpace,
        })
    })
}
