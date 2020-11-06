import checkDiskSpace from 'check-disk-space'

export { checkDiskSpace }

export function getUsedSpace(path: string): Promise<number> {
    return require('trammel')(path, { type: 'raw' })
}
