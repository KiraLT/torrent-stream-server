#!/usr/bin/env node

export * from './app'
export * from './config'
export * from './api'
export * from './services'
export * from './cli'

import { buildCli } from './cli'

if (!module.parent) {
    buildCli().argv
}
