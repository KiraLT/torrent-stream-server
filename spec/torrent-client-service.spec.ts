import { filterFiles } from '../src/services/torrent-client/helpers'

describe('filterFiles', () => {
    const file1 = {
        type: 'video/matrioska',
        name: 'video.mkv',
        path: 'root/video.mvk',
        length: 10000,
    }
    const file2 = {
        type: 'video/mp4',
        name: 'something.mp4',
        path: 'root/video.mp4',
        length: 1,
    }
    const file3 = {
        type: 'image/jpeg',
        name: 'image/jpg',
        path: 'root/image.jpg',
        length: 10,
    }
    const files = [file1, file2, file3]

    it('sorts files by size', () => {
        expect(filterFiles(files, {})).toEqual([file1, file3, file2])
    })
})
