import yargs from 'yargs'

import { serveCommand } from './serve'

yargs(process.argv.slice(2)).command(serveCommand).demandCommand().help().argv
