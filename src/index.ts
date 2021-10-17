#!/usr/bin/env node

export * from './app'
export * from './config'
export * from './api'
export * from './services/logging'
export * from './services/openapi'
export * from './services/torrent-client'
export * from './services/torrent-search'
export * from './cli'

import { buildCli } from './cli'

if (!module.parent) {
    buildCli().argv
}
