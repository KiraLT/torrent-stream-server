import {
    ProviderMeta,
    ProviderSearchOptions,
    ProviderTorrent,
    providers,
    ProviderName,
} from './providers'

export interface ProviderInfo extends ProviderMeta {
    name: string
}

export async function getProvidersInfo(): Promise<ProviderInfo[]> {
    return Promise.all(
        Object.entries(providers).map(async ([name, provider]) => ({
            name,
            ...(await provider.getMeta()),
        }))
    )
}

export async function search(
    searchProviders: ProviderName[],
    query: string,
    options: ProviderSearchOptions
): Promise<ProviderTorrent[]> {
    if (searchProviders.length !== 1) {
        throw new Error('Only 1 provider search is supported at the moment')
    }
    const provider = searchProviders[0]

    return providers[provider].search(query, options)
}

export function isProviderSupported(name: unknown): name is ProviderName {
    return typeof name === 'string' && name in providers
}
