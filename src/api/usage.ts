import { Globals } from '../config'
import { getUsedSpace, checkDiskSpace } from '../helpers/usage'
import { createRoute, Route } from '../helpers/openapi'

export function getUsageRouter({ config }: Globals): Route[] {
    return [
        createRoute('getUsage', async (_req, res) => {
            const space = await checkDiskSpace(config.torrents.path)
            const usedSpace = await getUsedSpace(config.torrents.path)

            return res.json({
                totalDiskSpace: space.size,
                freeDiskSpace: space.free,
                usedTorrentSpace: usedSpace,
            })
        }),
    ]
}
