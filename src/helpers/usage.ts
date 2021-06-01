import checkDiskSpace from 'check-disk-space'
import getFolderSize from 'get-folder-size'
import { access } from 'fs'
import { promisify } from 'util'

export { checkDiskSpace }

export async function getUsedSpace(path: string): Promise<number> {
    try {
        await promisify(access)(path)
        return new Promise((resolve, reject) =>
            getFolderSize(path, (err, size) => {
                if (size) {
                    resolve(size)
                } else {
                    reject(err)
                }
            })
        )
    } catch {
        return 0
    }
}
