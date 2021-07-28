export interface ProviderTorrent {
    id: string
    name: string
    magnet?: string
    seeds: number
    peers: number
    size: string
    time?: number
    downloads?: number
    category?: {
        id: string
        name: string
    }
    link?: string
    isVip?: boolean
    imdb?: string
    numFiles?: number
    comments?: number
    provider: string
}

export interface ProviderCategory {
    name: string
    id: string
    subcategories: {
        name: string
        id: string
    }[]
}

export interface ProviderMeta {
    provider: string
    categories: ProviderCategory[]
}

export interface ProviderSearchOptions {
    category?: string
    limit?: number
}

export abstract class Provider {
    public abstract providerName: string

    public abstract getMeta(): Promise<ProviderMeta>

    public async search(
        _query: string,
        _options?: ProviderSearchOptions
    ): Promise<ProviderTorrent[]> {
        throw new Error(`search is not supported`)
    }

    public async getMagnet(_id: string): Promise<string | undefined> {
        throw new Error(`getMagnet is not supported`)
    }
}

export interface ProviderError {
    error: string
    provider: string
}
