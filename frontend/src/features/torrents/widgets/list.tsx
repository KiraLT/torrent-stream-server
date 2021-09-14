import React from 'react'
import {
    Card,
    Row,
    Col,
    ListGroup,
    OverlayTrigger,
    Tooltip,
    Button,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatBytes, sortBy } from 'common-stuff'

import { TorrentModel, TorrentFileModel } from 'common/api'
import { formatFileName, getIconByType } from '../utils'

export function TorrentsListWidget({
    torrent,
}: {
    torrent: TorrentModel
}): JSX.Element {
    return (
        <>
            <Card>
                <Card.Header>
                    <Row className="mb-2">
                        <Col sm className="d-flex">
                            <span className="justify-content-center align-self-center">
                                <h5 className="text-break card-category">
                                    {torrent.name}
                                </h5>
                                <Card.Title as="h3" className="text-break">
                                    <i className="text-info ti-files" /> Files
                                </Card.Title>
                            </span>
                        </Col>
                        <Col sm="auto" className="d-flex">
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`video-playlist-tooltip`}>
                                        Download M3U playlist which can be
                                        opened with most Media Players
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
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`video-playlist-tooltip`}>
                                        Download all files as zip
                                    </Tooltip>
                                }
                            >
                                <Button
                                    as={'a'}
                                    href={torrent.streamZip}
                                    className="w-100 justify-content-center align-self-center btn-simple"
                                    target="_blank"
                                    rel="noreferrer"
                                    variant="success"
                                >
                                    <i className="ti-zip"></i> Download
                                </Button>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        {sortBy(torrent.files, (v) => v.path.split('/')).map(
                            (v) => (
                                <ListGroup.Item
                                    className="bg-transparent border-dark"
                                    key={v.path}
                                >
                                    <TorrentsListItemWidget
                                        file={v}
                                        torrent={torrent}
                                    />
                                </ListGroup.Item>
                            )
                        )}
                    </ListGroup>
                </Card.Body>
            </Card>
        </>
    )
}

export function TorrentsListItemWidget({
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
                                    <span className="text-muted">
                                        {part} /{' '}
                                    </span>
                                ) : (
                                    part
                                )
                            )}{' '}
                        <i
                            className={`${getIconByType(file.type)} text-info`}
                        />
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
                                    <Tooltip id={`play-tooltip-${file.path}`}>
                                        Play file
                                    </Tooltip>
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
