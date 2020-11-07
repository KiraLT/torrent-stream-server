import yargs from 'yargs'

import { serveCommand } from './serve'

export const buildCli = (args?: string[]) => {
    return yargs(args || process.argv.slice(2))
        .command(serveCommand)
        .demandCommand()
        .help()
}
