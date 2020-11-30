export * from './base'

import { NyaaProvider } from './nyaa'
import { ThepiratebayProvider } from './thepiratebay'
import { TorrentParadiseProvider } from './torrentparadise'
import { X1337Provider } from './1337x'

export const providers = {
    [NyaaProvider.providerName]: new NyaaProvider(),
    [ThepiratebayProvider.providerName]: new ThepiratebayProvider(),
    [TorrentParadiseProvider.providerName]: new TorrentParadiseProvider(),
    [X1337Provider.providerName]: new X1337Provider(),
}

export type ProviderName = keyof typeof providers
