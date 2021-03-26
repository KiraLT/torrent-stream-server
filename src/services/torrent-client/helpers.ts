import fetch from 'node-fetch'
import { extname } from 'path'

export const mirrors = [
    'https://ngosang.github.io/trackerslist/trackers_all.txt',
    'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt',
    'https://cdn.jsdelivr.net/gh/ngosang/trackerslist/trackers_all.txt',
]

/**
 * Download tracker list from https://github.com/ngosang/trackerslist
 */
export async function downloadTrackers(): Promise<string[]> {
    for (const mirror of mirrors) {
        try {
            return fetch(mirror, {
                timeout: 3000,
            })
                .then((v) => v.text())
                .then((v) =>
                    v
                        .split('\n')
                        .map((v) => v.trim())
                        .filter((v) => !!v)
                )
        } catch {
            continue
        }
    }
    throw new Error('Failed to download trackers')
}

export interface FindFileOptions {
    /**
     * Case insensitive file name or path
     */
    file?: string
    /**
     * File index (starting from `1`)
     */
    fileIndex?: number
    /**
     * Case insensitive file mime type (e.g. `video`, `video/mp4`, `mp4`) or file extension (e.g. `.mp4`, `mp4`)
     */
    fileType?: string
}

/**
 * Find a file by given options, returns the biggest file
 * @param files
 * @param options
 */
export function filterFiles<T extends { type: string; name: string; path: string; length: number }>(
    files: T[],
    options: FindFileOptions
): T[] {
    const filteredFiles = files.filter(
        (f, i) =>
            (options.fileIndex === undefined || options.fileIndex == i + 1) &&
            (options.file === undefined ||
                [f.name, f.path.replace(/^\//, '')]
                    .map((v) => v.toLowerCase())
                    .includes(options.file.replace(/^\//, '').toLowerCase())) &&
            (options.fileType === undefined ||
                [...f.type.split('/'), f.type, extname(f.name)]
                    .map((v) => v.toLowerCase().replace('.', ''))
                    .includes(options.fileType.toLowerCase().replace('.', '')))
    )

    const file = filteredFiles.find((f) => options.file && f.path === options.file)

    return file ? [file] : [...filteredFiles].sort((a, b) => b.length - a.length)
}
