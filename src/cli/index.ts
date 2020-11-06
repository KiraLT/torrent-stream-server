import yargs, { Argv } from 'yargs'

import { serveCommand } from './serve'

export const buildCli = (args: string[]) => yargs(args).command(serveCommand).demandCommand().help()

if (!module.parent) {
    buildCli(process.argv.slice(2)).argv
}
