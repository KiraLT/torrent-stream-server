import { CommandModule } from 'yargs'

import { setup } from '../app'

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
    async handler({ config }) {
        try {
            await setup({
                configFile: config,
            })
        } catch (err) {
            console.error(String(err))
            process.exit(1)
        }
    },
}
