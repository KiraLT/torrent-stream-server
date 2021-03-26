import fetch, { Response } from 'node-fetch'
import cheerio from 'cheerio'

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
