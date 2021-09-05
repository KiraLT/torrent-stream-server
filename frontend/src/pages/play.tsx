import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { useAsync } from 'react-async-hook'

import { TorrentsApi } from 'common/api'
import { getApiConfig } from 'config'
import { addHistoryItem } from 'features/history'
import { TorrentsListWidget, TorrentViewWidget } from 'features/torrents'
import { withBearer } from 'common/hoc'
import { ResultContainer } from 'common/layout'

export default withBearer(({ bearer }) => {
    const location = useLocation()
    const [link, file] = useMemo(() => {
        const parsed = new URLSearchParams(location.search)
        return [
            parsed.get('torrent') || undefined,
            parsed.get('file') || undefined,
        ]
    }, [location.search])

    if (link) {
        return <PlayPage link={link} file={file} bearer={bearer} />
    }
    return <></>
})

function PlayPage({
    link,
    file,
    bearer,
}: {
    link: string
    file?: string
    bearer?: string
}) {
    const torrent = useAsync(async () => {
        return new TorrentsApi(getApiConfig({ bearer }))
            .createTorrent({
                torrent: link,
            })
            .then((v) => {
                addHistoryItem({
                    name: v.name,
                    link: v.link,
                })
                return v
            })
    }, [link, bearer])

    const torrentFile = useMemo(
        () => torrent.result?.files.find((v) => v.path === file),
        [torrent, file]
    )

    return (
        <Container className="mt-3">
            <ResultContainer result={torrent}>
                {(result) => (
                    <>
                        {torrentFile && (
                            <TorrentViewWidget
                                file={torrentFile}
                                torrent={result}
                            />
                        )}
                        <TorrentsListWidget torrent={result} />
                    </>
                )}
            </ResultContainer>
        </Container>
    )
}
