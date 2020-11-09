import { Router } from 'express'
import { Logger } from 'winston'

import { Config } from '../config'
import { Success } from '../models'

export function getAuthRouter(_config: Config, _logger: Logger): Router {
    return Router().post<{}, Success, {}, {}>('/auth', async (_req, res) => {
        res.json({
            success: true,
        })
    })
}
