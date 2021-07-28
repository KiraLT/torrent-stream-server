import { sortBy, extractWords } from 'common-stuff'
import {
    ProviderMeta,
    ProviderSearchOptions,
    ProviderTorrent,
    Provider,
    ProviderError
} from './providers'

import { executeProviders } from './helpers'

export interface ProvidersResult<T> {
    items: T
    errors: ProviderError[]
}

export async function getMeta(targetProviders: Provider[]): Promise<ProvidersResult<ProviderMeta[]>> {
    return executeProviders(targetProviders, v => v.getMeta())
}

export async function search(
    targetProviders: Provider[],
    query: string,
    options: ProviderSearchOptions
): Promise<ProvidersResult<ProviderTorrent[]>> {
    const words = extractWords(query)
    const { errors, items } = await executeProviders(targetProviders, v => v.search(query, options))

    return {
        errors,
        items: sortBy(items.flat(), v => {
            const index = extractWords(v.name)
            return [
                words.filter(word => index.includes(word)).length * -1,
                v.seeds * -1
            ]
        }),
    }
}