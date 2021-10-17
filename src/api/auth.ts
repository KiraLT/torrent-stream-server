import { Globals } from '../config'
import { createRoute, Route } from '../services/openapi'

export function getAuthRouter({}: Globals): Route[] {
    return [
        createRoute('auth', (_req, resp) => {
            return resp.json({
                success: true,
            })
        }),
    ]
}
