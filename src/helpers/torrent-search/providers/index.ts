export enum ProviderFeature {
    Search = 'search',
}

export interface ProviderResult {
    name: string
    magnet: string
    seeds: number
    peers: number
    size: string
    time: number
    downloads?: number
    category: {
        id: string
        name: string
    }
    link: string
    isVip?: boolean
    imdb?: string
    numFiles?: number
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
    categories: ProviderCategory[]
    features: ProviderFeature[]
}

export interface ProviderSearchOptions {
    category?: string
    limit?: number
}

export abstract class Provider {
    static providerName: string
    public abstract async getMeta(): Promise<ProviderMeta>
    public abstract async search(
        query: string,
        options?: ProviderSearchOptions
    ): Promise<ProviderResult[]>
}
