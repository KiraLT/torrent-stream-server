export interface HistoryItem {
    name: string
    link: string
}

export const historyKey = 'torrentsHistory'
export const historyLimit = 10

export function addHistoryItem(value: HistoryItem): void {
    const items = getHistoryItems()
    localStorage.setItem(
        historyKey,
        JSON.stringify(
            [value, ...items.filter((v) => v.link !== value.link)].slice(0, historyLimit)
        )
    )
}

export function removeHistoryItem(value: HistoryItem): void {
    const items = getHistoryItems()
    localStorage.setItem(historyKey, JSON.stringify(items.filter((v) => v.link !== value.link)))
}

export function getHistoryItems(): HistoryItem[] {
    const str = localStorage.getItem(historyKey)
    try {
        return str ? JSON.parse(str) : []
    } catch {
        return []
    }
}
