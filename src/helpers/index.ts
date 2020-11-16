import { sign, verify } from 'jsonwebtoken'

export function exists(json: any, key: string) {
    const value = json[key]
    return value !== null && value !== undefined
}

export function mapValues(data: any, fn: (item: any) => any) {
    return Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: fn(data[key]) }), {})
}

export function merge(current: any, update: any): any {
    current = { ...current }
    Object.keys(update).forEach(function (key) {
        if (
            current.hasOwnProperty(key) &&
            typeof current[key] === 'object' &&
            !(current[key] instanceof Array)
        ) {
            current[key] = merge(current[key], update[key])
        } else {
            current[key] = update[key]
        }
    })
    return current
}

export function signJwtToken(data: object | string, key: string): string {
    return sign(data, key)
}

export function verifyJwtToken<T extends object | string>(
    token: string,
    key: string,
    maxAge: string
): T | undefined {
    try {
        return verify(token, key, {
            maxAge,
        }) as any
    } catch (error) {
        console.log(error)
        return undefined
    }
}

export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getSteamUrl(torrent: string, file: string, encodeToken?: string): string {
    if (encodeToken) {
        return `/stream/${encodeURIComponent(
            signJwtToken(
                {
                    torrent,
                    file,
                },
                encodeToken
            )
        )}`
    }

    return `/stream/${encodeURIComponent(torrent)}?file=${encodeURIComponent(file)}`
}

export function getPlaylistUrl(torrent: string, encodeToken?: string): string {
    if (encodeToken) {
        return `/playlist/${encodeURIComponent(
            signJwtToken(
                {
                    torrent,
                },
                encodeToken
            )
        )}`
    }

    return `/playlist/${encodeURIComponent(torrent)}`
}
