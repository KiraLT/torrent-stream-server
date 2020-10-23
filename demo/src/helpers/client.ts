export interface TorrentMeta {
    link: string
    infoHash: string
    name: string
    started: number
    updated: number
    files: {
        name: string
        path: string
        length: number
    }[]
    downloaded: number
    downloadSpeed: number
}

export interface Usage {
    totalDiskSpace: number,
    freeDiskSpace: number,
    usedTorrentSpace: number,
}

const apiDomain = process.env.NODE_ENV === 'production' ? `${window.location.protocol}//${window.location.host}` : 'http://127.0.0.1:3000' 
const streamUrl = `${apiDomain}/stream`

let apiKey = ''
let modalActive = false
const modalQueue: Array<() => void> = []

async function request(path: string, options?: RequestInit): Promise<Response> {
    const retry = () => {
        return fetch(`${apiDomain}/${path}`, {
            ...(apiKey ? {
                headers: {
                    authorization: `bearer ${apiKey}`,
                    ...(options || {}).headers
                }
            } : {}),
            ...options
        })
    }
    return retry().then(v => handleResponse(v, retry))
}

async function handleResponse(response: Response, retry: () => Promise<Response>): Promise<Response> {
    if (!response.ok) {
        if (response.status === 403) {
            if (modalActive) {
                return new Promise((resolve, reject) => {
                    modalQueue.push(() => {
                        retry().then(v => resolve(handleResponse(v, retry))).catch(reject)
                    })
                })
            } else {
                modalActive = true
                return new Promise((resolve, reject) => {
                    const modal = document.getElementById('authorization_modal')
                    const form = document.getElementById('authorization_form')
                    const input = document.getElementById('authorization_input')
                    const backdrop = document.getElementById('backdrop') 
                    if (modal instanceof HTMLElement && form instanceof HTMLFormElement && input instanceof HTMLInputElement && backdrop) {
                        document.body.classList.add('modal-open')
                        modal.style.display = 'block'
                        backdrop.style.display = 'block'

                        const callback = (event: Event) => {
                            event.preventDefault()
                            if (input.value) {
                                apiKey = input.value
                                form.removeEventListener('submit', callback)
                                document.body.classList.remove('modal-open')
                                modal.style.display = ''
                                backdrop.style.display = 'none'
                                modalActive = false
                                retry().then(async v => {
                                    resolve(handleResponse(v, retry))
                                    modalQueue.forEach(cb => {
                                        cb()
                                    })
                                }).catch(reject)
                            }
                        }

                        form.addEventListener('submit', callback)
                    }
                    // resolve(retry())
                })
            }
        }
        let error: string
        try {
            error = (await response.json()).error
        } catch (err) {
            error = String(err)
        }
        throw Error(error) || 'Bad response'
    }
    return response
}


export async function createTorrent({ link }: { link: string }): Promise<TorrentMeta> {
    return request(`api/torrents?torrent=${link}`, {
        method: 'POST'
    }).then(v => v.json())
}

export async function getTorrents(): Promise<TorrentMeta[]> {
    return request(`api/torrents`).then(v => v.json())
}

export function getSteamUrl(link: string, file: string): string {
    return `${streamUrl}?torrent=${encodeURIComponent(link)}&file=${encodeURIComponent(file)}`
}

export async function getUsage(): Promise<Usage> {
    return request(`api/usage`).then(v => v.json())
}

export interface BrowseTorrent {
    name: string
    magnet: string
    seeds?: number
    peers?: number
    downloads?: number
    size: string
    time: string
}

export interface BrowseProvider {
    name: string
    categories: string[]
}

export async function getProviders(): Promise<BrowseProvider[]> {
    return request(`api/browse/providers`, {
        method: 'GET'
    }).then(v => v.json())
}

export async function searchTorrents(provider: string, query: string, category: string): Promise<BrowseTorrent[]> {
    const params = new URLSearchParams({
        q: query,
        c: category
    })
    return request(`api/browse/search/${encodeURIComponent(provider)}?${params.toString()}`, {
        method: 'GET'
    }).then(v => v.json())
}