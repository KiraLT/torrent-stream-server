import { Globals } from '../config'
import { createRoute, Route } from '../services/openapi'

export function getLogsRouter({ logStorage }: Globals): Route[] {
    return [
        createRoute('getLogs', (_req, resp) => {
            return resp.json(logStorage.get())
        }),
    ]
}
