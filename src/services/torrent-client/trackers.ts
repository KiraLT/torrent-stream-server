import fetch from 'node-fetch'

export const mirrors = [
    'https://ngosang.github.io/trackerslist/trackers_all.txt',
    'https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt',
    'https://cdn.jsdelivr.net/gh/ngosang/trackerslist/trackers_all.txt'
]

/**
 * Download tracker list from https://github.com/ngosang/trackerslist
 */
export async function downloadTrackers(): Promise<string[]> {
    for (const mirror of mirrors) {
        try {
            return fetch(mirror, {
                timeout: 3000
            }).then(v => v.text()).then(v => v.split('\n').map(v => v.trim()).filter(v => !!v))
        } catch {
            continue
        }
    }
    throw new Error('Failed to download trackers')
}
