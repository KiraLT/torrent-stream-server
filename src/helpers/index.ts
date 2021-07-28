import { sign, verify } from 'jsonwebtoken'

import { getRouteUrl } from './openapi'

export function exists(json: any, key: string) {
    const value = json[key]
    return value !== null && value !== undefined
}

export function mapValues(data: any, fn: (item: any) => any) {
    return Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: fn(data[key]) }), {})
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

export function getSteamUrl(torrent: string, file: string, encodeToken?: string): string {
    if (encodeToken) {
        return getRouteUrl(
            'getStream',
            {
                torrent: signJwtToken(
                    {
                        torrent,
                        file,
                    },
                    encodeToken
                ),
            },
            {}
        )
    }

    return getRouteUrl(
        'getStream',
        {
            torrent,
        },
        { file }
    )
}

export function getPlaylistUrl(torrent: string, encodeToken?: string): string {
    if (encodeToken) {
        return getRouteUrl(
            'getPlaylist',
            {
                torrent: signJwtToken(
                    {
                        torrent,
                    },
                    encodeToken
                ),
            },
            {}
        )
    }

    return getRouteUrl('getPlaylist', { torrent }, {})
}
