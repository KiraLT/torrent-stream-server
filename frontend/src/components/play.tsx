import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
    Card,
    Button,
    Row,
    Col,
    ListGroup,
    Container,
    OverlayTrigger,
    Tooltip,
} from 'react-bootstrap'

import { TorrentsApi, TorrentModel, TorrentFileModel } from '../helpers/client'
import { getApiConfig } from '../config'
import { formatBytes, sortBy, parseError } from '../helpers'
import { addHistoryItem } from '../helpers/history'
import { withBearer } from './parts/auth'
import { TorrentFileComponent } from './parts/play'

export const PlayComponent = withBearer(({ bearer }) => {
    const [torrent, setTorrent] = useState<TorrentModel>()
    const [error, setError] = useState('')
    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)
    const link = searchParams.get('torrent')
    const file = searchParams.get('file')

    const torrentFile = torrent?.files.find((v) => v.path === file)

    useEffect(() => {
        const action = async () => {
            if (link) {
                const newTorrent = await new TorrentsApi(getApiConfig({ bearer })).createTorrent({
                    torrent: link,
                })
                setTorrent(newTorrent)
                addHistoryItem({
                    name: newTorrent.name,
                    link: newTorrent.link,
                })
            } else {
                setError('Torrent link is not specified')
            }
        }
        action().catch(async (err) => {
            setError(await parseError(err))
        })
    }, [link, bearer])

    return (
        <Container className="mt-3">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            {!torrent && !error && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
            {torrentFile && torrent && <PlayVideoComponent file={torrentFile} torrent={torrent} />}
            {torrent && <FilesComponent torrent={torrent} />}
        </Container>
    )
})

function FilesComponent({ torrent }: { torrent: TorrentModel }): JSX.Element {
    return (
        <>
            <Card>
                <Card.Header>
                    <Row className="mb-2">
                        <Col sm className="d-flex">
                            <span className="justify-content-center align-self-center">
                                <h5 className="text-break card-category">{torrent.name}</h5>
                                <Card.Title as="h3" className="text-break">
                                    <i className="text-info ti-files" /> Files
                                </Card.Title>
                            </span>
                        </Col>
                        <Col sm="auto" className="d-flex">
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`video-playlist-tooltip`}>
                                        Download M3U playlist which can be opened with most Media
                                        Players
                                    </Tooltip>
                                }
                            >
                                <Button
                                    as={'a'}
                                    href={torrent.playlist}
                                    className="w-100 justify-content-center align-self-center btn-simple"
                                    target="_blank"
                                    rel="noreferrer"
                                    variant="success"
                                >
                                    <i className="ti-cloud-down"></i> Playlist
                                </Button>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        {sortBy(torrent.files, (v) => v.path.split('/')).map((v) => (
                            <ListGroup.Item className="bg-transparent border-dark" key={v.path}>
                                <FileComponent file={v} torrent={torrent} />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        </>
    )
}

function getIconByType(type: string): string {
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

function formatFileName(filePath: string, torrentName: string): string {
    const parts = filePath.split('/')
    if (parts.length > 1 && parts[0] === torrentName) {
        return parts.slice(1).join('/')
    }
    return filePath
}

function FileComponent({
    file,
    torrent,
}: {
    file: TorrentFileModel
    torrent: TorrentModel
}): JSX.Element {
    return (
        <>
            <Row>
                <Col sm className="d-flex">
                    <span className="justify-content-center align-self-center text-break">
                        {formatFileName(file.path, torrent.name)
                            .split('/')
                            .map((part, index, arr) =>
                                index + 1 < arr.length ? (
                                    <span className="text-muted">{part} / </span>
                                ) : (
                                    part
                                )
                            )}{' '}
                        <i className={`${getIconByType(file.type)} text-info`} />
                    </span>
                </Col>
                <Col sm={'auto'}>
                    <Row>
                        <Col xs={6} className="d-flex">
                            <span
                                className="justify-content-center align-self-center text-nowrap"
                                style={{ minWidth: '120px' }}
                            >
                                {formatBytes(file.length)}
                            </span>
                        </Col>
                        <Col xs={6} className="d-flex text-right">
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`play-tooltip-${file.path}`}>Play file</Tooltip>
                                }
                            >
                                <Button
                                    as={Link}
                                    to={`?torrent=${encodeURIComponent(
                                        torrent.link
                                    )}&file=${encodeURIComponent(file.path)}`}
                                    variant="success"
                                    className={`ti-control-play justify-content-center align-self-center pr-4 pl-4`}
                                    onClick={() => window.scrollTo(0, 0)}
                                />
                            </OverlayTrigger>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`play-tooltip-${file.path}`}>
                                        Download file
                                    </Tooltip>
                                }
                            >
                                <Button
                                    as={'a'}
                                    href={file.stream}
                                    className="ti-cloud-down justify-content-center align-self-center pr-4 pl-4"
                                    target="_blank"
                                    rel="noreferrer"
                                    variant="info"
                                />
                            </OverlayTrigger>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

function PlayVideoComponent({
    file,
    torrent,
}: {
    file: TorrentFileModel
    torrent: TorrentModel
}): JSX.Element {
    return (
        <>
            <>
                <TorrentFileComponent file={file} />
                <Card className="mt-3">
                    <Card.Header>
                        <Row className="">
                            <Col sm className="d-flex">
                                <span className="justify-content-center align-self-center">
                                    <h5 className="text-break card-category">{torrent.name}</h5>
                                    <Card.Title as="h4" className="text-break">
                                        {formatFileName(file.path, torrent.name)}
                                    </Card.Title>
                                </span>
                            </Col>
                            <Col sm="auto" className="d-flex mb-3">
                                <Button
                                    as={'a'}
                                    href={file.stream}
                                    className="w-100 justify-content-center align-self-center btn-simple"
                                    target="_blank"
                                    rel="noreferrer"
                                    variant="success"
                                >
                                    <i className="ti-cloud-down"></i> Download
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>
                </Card>
            </>
        </>
    )
}
