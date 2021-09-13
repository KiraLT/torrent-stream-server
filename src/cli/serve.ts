import { CommandModule } from 'yargs'
import { ensureError } from 'common-stuff'

import { createAndRunApp } from '../app'

export interface ServeArgs {
    config: string
}

export const serveCommand: CommandModule<{}, ServeArgs> = {
    command: ['serve'],
    describe: 'run torrent stream server',
    builder: {
        config: {
            type: 'string',
            alias: 'c',
            desc: 'path to JSON config',
        },
    },
    handler({ config }) {
        try {
            createAndRunApp({
                configFile: config,
            })
        } catch (err) {
            console.error(ensureError(err).message)
            process.exit(1)
        }
    },
}
