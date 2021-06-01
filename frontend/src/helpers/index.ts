import * as timeago from 'timeago.js'

export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function sortBy<T>(
    arr: T[],
    key: (item: T) => unknown = (v) => v,
    order: 'asc' | 'desc' = 'asc'
): T[] {
    const sorted = [...arr].sort((a, b) => {
        const doCompare = (keyA: unknown, keyB: unknown): number => {
            if (typeof keyA === 'number' && typeof keyB === 'number') {
                return keyA < keyB ? -1 : keyA > keyB ? 1 : 0
            }

            if (keyA instanceof Array && keyB instanceof Array) {
                const res = keyA.map((v, i) => doCompare(v, keyB[i])).filter((v) => v !== 0)
                return res.length ? res[0] : 1
            }

            if (typeof keyA === 'object' && typeof keyB === 'object') {
                return doCompare(Object.values(keyA ?? {})[0], Object.values(keyB ?? {})[0])
            }

            const stringA = String(keyA).toLowerCase()
            const stringB = String(keyB).toLowerCase()

            return stringA < stringB ? -1 : stringA > stringB ? 1 : 0
        }

        return doCompare(key(a), key(b))
    })
    return order === 'desc' ? sorted.reverse() : sorted
}

export async function parseError(err: unknown): Promise<string> {
    if (err instanceof Response) {
        try {
            const data = (await err.json()).error
            if (!data) {
                throw new Error()
            }
            return data
        } catch {
            return `Server returned error: ${err.statusText}`
        }
    }
    if (err instanceof Error) {
        if (err.message === 'Failed to fetch') {
            return 'Failed to fetch response, maybe your are offline?'
        }

        return err.message
    }
    return String(err)
}

export async function handleApiError(err: unknown): Promise<never> {
    throw new Error(await parseError(err))
}

export function getExtension(filename: string): string {
    const parts = filename.split('.')
    return parts[parts.length - 1]
}

export function formatDate(date: Date): string {
    timeago.register(
        'short',
        (_, index) =>
            [
                ['now', 'right now'],
                ['%ss ago', 'in %s seconds'],
                ['1min ago', 'in 1 minute'],
                ['%smin ago', 'in %s minutes'],
                ['1h ago', 'in 1 hour'],
                ['%sh ago', 'in %s hours'],
                ['1d ago', 'in 1 day'],
                ['%sd ago', 'in %s days'],
                ['1w ago', 'in 1 week'],
                ['%sw ago', 'in %s weeks'],
                ['1m ago', 'in 1 month'],
                ['%sm ago', 'in %s months'],
                ['1y ago', 'in 1 year'],
                ['%sy ago', 'in %s years'],
            ][index] as [string, string]
    )

    return timeago.format(date, 'short')
}

export async function getLatestVersion(packageName: string): Promise<string> {
    const response = await fetch(`https://unpkg.com/${packageName}/package.json`)

    if (response.ok) {
        const data = await response.json()
        const version = data.version

        if (version) {
            return version
        }
    }

    throw new Error('Failed to fetch version')
}
