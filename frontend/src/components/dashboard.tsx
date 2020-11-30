import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Card,
    Alert,
    CardDeck,
    ProgressBar,
    Container,
    Spinner,
    ListGroup,
    Row,
    Col,
    Button,
} from 'react-bootstrap'

import { DashboardApi, TorrentsApi, TorrentModel, UsageModel } from '../helpers/client'
import { formatBytes, parseError, formatDate } from '../helpers'
import { getApiConfig } from '../config'
import { withBearer } from './parts/auth'

export const DashboardComponent = withBearer(({ bearer }) => {
    const [torrents, setTorrents] = useState<TorrentModel[]>()
    const [usage, setUsage] = useState<UsageModel>()
    const [error, setError] = useState('')

    const updateTorrents = async () =>
        new TorrentsApi(getApiConfig({ bearer }))
            .getTorrents()
            .then((v) => setTorrents(v))
            .catch(async (err) => {
                setError(await parseError(err))
            })
    const updateUsage = async () =>
        new DashboardApi(getApiConfig({ bearer }))
            .getUsage()
            .then((v) => setUsage(v))
            .catch(async (err) => {
                setError(await parseError(err))
            })

    useEffect(() => {
        let torrentsInterval: NodeJS.Timeout
        let usageInterval: NodeJS.Timeout

        updateTorrents().then(() => {
            torrentsInterval = setInterval(() => {
                updateTorrents()
            }, 5 * 1000)
        })
        updateUsage().then(() => {
            usageInterval = setInterval(() => {
                updateTorrents()
            }, 60 * 1000)
        })

        return () => {
            clearInterval(torrentsInterval)
            clearInterval(usageInterval)
        }
        // eslint-disable-next-line
    }, [])

    return (
        <Container className="mt-3 content">
            {error && <Alert variant="danger">{error}</Alert>}
            {!torrents && !error && (
                <div className="d-flex justify-content-center mt-5">
                    <Spinner animation="border" />
                </div>
            )}
            {usage && (
                <CardDeck className="mb-3 text-center">
                    <Card>
                        <Card.Header>
                            <Card.Title as="h4">
                                <i className="ti-stats-down text-info" /> Disk space
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title as="h2">
                                {formatBytes(usage.totalDiskSpace - usage.freeDiskSpace)}
                                <small className="text-muted">
                                    {' / '}
                                    {formatBytes(usage.totalDiskSpace)}
                                </small>
                            </Card.Title>
                            <ProgressBar
                                variant="info"
                                min={0}
                                max={usage.totalDiskSpace}
                                now={usage.totalDiskSpace - usage.freeDiskSpace}
                            />
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h4">
                                <i className="ti-stats-down text-warning" /> Torrents space
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title as="h2">
                                {formatBytes(usage.usedTorrentSpace)}
                                <small className="text-muted">
                                    {' / '}
                                    {formatBytes(usage.freeDiskSpace + usage.usedTorrentSpace)}
                                </small>
                            </Card.Title>
                            <ProgressBar
                                variant="info"
                                min={0}
                                max={usage.freeDiskSpace + usage.usedTorrentSpace}
                                now={usage.usedTorrentSpace}
                            />
                        </Card.Body>
                    </Card>
                </CardDeck>
            )}
            {torrents && (
                <>
                    {torrents.length ? (
                        <Card>
                            <Card.Header>
                                <Card.Title as="h3">
                                    <i className="ti-bar-chart text-info" /> History
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {torrents.map((torrent) => (
                                        <ListGroup.Item
                                            key={torrent.infoHash}
                                            className="bg-transparent border-dark"
                                        >
                                            <Row>
                                                <Col xs className="d-flex mb-2">
                                                    <span className="justify-content-center align-self-center text-break">
                                                        {torrent.name}
                                                    </span>
                                                </Col>
                                                <Col sm="auto" className="d-flex mb-2">
                                                    <Row className="justify-content-center align-self-center ">
                                                        <Col className="d-flex pr-2 pl-2">
                                                            <span className="justify-content-center align-self-center">
                                                                <span className="text-nowrap">
                                                                    {formatBytes(
                                                                        torrent.downloaded
                                                                    )}
                                                                </span>{' '}
                                                                <span className="text-nowrap">
                                                                    (
                                                                    {formatBytes(
                                                                        torrent.downloadSpeed
                                                                    )}
                                                                    /s)
                                                                </span>
                                                            </span>
                                                        </Col>
                                                        <Col className="d-flex pr-1 pl-2">
                                                            <span className="justify-content-center align-self-center">
                                                                {formatDate(
                                                                    new Date(torrent.started)
                                                                )}
                                                            </span>
                                                        </Col>
                                                        <Col className="d-flex pr-2 pl-2">
                                                            <span className="justify-content-center align-self-center ml-auto">
                                                                <Button
                                                                    as={Link}
                                                                    to={`/play?torrent=${encodeURIComponent(
                                                                        torrent.link
                                                                    )}`}
                                                                    variant="success"
                                                                    className="ti-control-play pr-4 pl-4"
                                                                ></Button>
                                                            </span>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    ) : (
                        <Alert variant="warning">No active torrents at the moment</Alert>
                    )}
                </>
            )}
        </Container>
    )
})
