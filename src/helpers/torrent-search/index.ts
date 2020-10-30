import { ProviderMeta, ProviderSearchOptions, ProviderResult } from './providers'
import { NyaaProvider } from './providers/nyaa'
import { ThepiratebayProvider } from './providers/thepiratebay'

export const providers = {
    [NyaaProvider.providerName]: new NyaaProvider(),
    [ThepiratebayProvider.providerName]: new ThepiratebayProvider()
}

export type Provider = keyof typeof providers

export interface ProviderInfo extends ProviderMeta {
    name: string
}

export async function getProvidersInfo(): Promise<ProviderInfo[]> {
    return Promise.all(
        Object.entries(providers).map(async ([name, provider]) => {
            const meta = await provider.getMeta()
            return {
                name,
                ...meta
            }
        })
    )
}

export async function search(searchProviders: Provider[], query: string, options: ProviderSearchOptions): Promise<ProviderResult[]> {
    if (searchProviders.length !== 1) {
        throw new Error('Only 1 provider search is supported at the moment')
    }
    const provider = searchProviders[0]

    return providers[provider].search(query, options)
}

export function isProviderSupported(name: unknown): name is Provider {
    if (typeof name === 'string' && name in providers) {
        return true
    }
    return false
}