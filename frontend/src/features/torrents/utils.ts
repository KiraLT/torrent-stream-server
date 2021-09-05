export function getIconByType(type: string): string {
    if (type.includes('video')) {
        return 'ti-control-play'
    }
    if (type.includes('image')) {
        return 'ti-image'
    }
    if (type.includes('text')) {
        return 'ti-text'
    }
    return ''
}

export function formatFileName(filePath: string, torrentName: string): string {
    const parts = filePath.split('/')
    if (parts.length > 1 && parts[0] === torrentName) {
        return parts.slice(1).join('/')
    }
    return filePath
}
