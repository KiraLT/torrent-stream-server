export * from './base'

import { NyaaProvider } from './nyaa'
import { ThepiratebayProvider } from './thepiratebay'
import { TorrentParadiseProvider } from './torrentparadise'
import { X1337Provider } from './1337x'
import { Provider } from './base'
import { TorrentsBrowserError } from '../errors'

export const defaultProviders = [
    new NyaaProvider(),
    new ThepiratebayProvider(),
    new TorrentParadiseProvider(),
    new X1337Provider(),
]

export function getDefaultProviders(providerNames: string[]): Provider[] {
    return providerNames.map(getDefaultProvider)
}

export function getDefaultProvider(providerName: string): Provider {
    const provider = defaultProviders.find(p => p.providerName === providerName)

    if (provider) {
        return provider
    }

    throw new TorrentsBrowserError(
        `Unknown torrents provider: ${providerName}`
    )
}

