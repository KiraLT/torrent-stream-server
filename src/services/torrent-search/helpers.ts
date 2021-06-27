import fetch, { Response } from 'node-fetch'
import cheerio from 'cheerio'

import { Provider, ProviderError } from './providers'

export function formatMagnet(infoHash: string, name: string, trackers: string[]) {
    const trackersQueryString = trackers.length
        ? `&tr=${trackers.map(encodeURIComponent).join('&tr=')}`
        : ''
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}${trackersQueryString}`
}

const defaultHeaders = {
    'User-Agent': `torrent-stream-server (+https://github.com/KiraLT/torrent-stream-server)`,
}

export async function loadPage(url: string): Promise<Response> {
    const response = await fetch(url, {
        headers: defaultHeaders,
        timeout: 5000,
    })

    if (!response.ok) {
        throw new Error('Failed to load results')
    }

    return response
}

export async function loadJson<T>(url: string): Promise<T> {
    return loadPage(url).then((v) => v.json())
}

export async function crawlPage(url: string): Promise<{ $: cheerio.Root }> {
    const response = await loadPage(url)

    return {
        $: cheerio.load(await response.text()),
    }
}

export function parseErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}

export async function executeProviders<T>(providers: Provider[], callback: (provider: Provider) => T | Promise<T>): Promise<{items: T[], errors: ProviderError[]}>  {
    const responses = await Promise.all(
        providers.map(
            v => Promise.resolve(callback(v))
                .catch(err => ({
                    error: parseErrorMessage(err),
                    provider: v.providerName
                })))
    )

    return {
        items: responses.filter((v): v is T => !('error' in v)),
        errors: responses.filter((v): v is ProviderError => 'error' in v)
    }
}
