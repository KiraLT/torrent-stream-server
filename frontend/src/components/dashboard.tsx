import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGlobal } from 'reactn'
import {
    Card,
    Alert,
    CardDeck,
    ProgressBar,
    Container,
    ListGroup,
    Row,
    Col,
    Button,
} from 'react-bootstrap'
import { useAsync } from 'react-async-hook'

import { DashboardApi, TorrentsApi } from '../helpers/client'
import { formatBytes, formatDate, handleApiError } from '../helpers'
import { getApiConfig } from '../config'
import { withBearer, ErrorComponent, LoaderComponent } from './parts'

export const DashboardComponent = withBearer(() => {
    return (
        <Container className="mt-3 content">
            <UsageComponent />
            <ActiveTorrentsComponent />
        </Container>
    )
})

function ActiveTorrentsComponent(): JSX.Element {
    const [bearer] = useGlobal('bearer')

    const torrents = useAsync(
        async () => {
            return new TorrentsApi(getApiConfig({ bearer })).getTorrents().catch(handleApiError)
        },
        [bearer],
        {
            setLoading: (s) => {
                // Prevent clearing previous state
                return s
            },
        }
    )

    useEffect(() => {
        let interval = setInterval(() => {
            torrents.execute()
        }, 5 * 1000)

        return () => {
            clearInterval(interval)
        }
    }, [torrents])

    return (
        <>
            {torrents.error ? (
                <ErrorComponent error={torrents.error} retry={torrents.execute} />
            ) : undefined}
            {torrents.loading && !torrents.result && <LoaderComponent />}
            {torrents.result && (
                <>
                    {torrents.result.length ? (
                        <Card>
                            <Card.Header>
                                <Card.Title as="h3">
                                    <i className="ti-bar-chart text-info" /> Activity
                                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {torrents.result.map((torrent) => (
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
                                                <Col lg={4} className="d-flex mb-2">
                                                    <Row className="justify-content-center align-self-center w-100">
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
        </>
    )
}

function UsageComponent(): JSX.Element {
    const [bearer] = useGlobal('bearer')
    const usage = useAsync(
        async () => {
            return new DashboardApi(getApiConfig({ bearer })).getUsage().catch(handleApiError)
        },
        [],
        {
            setLoading: (s) => {
                // Prevent clearing previous state
                return s
            },
        }
    )

    useEffect(() => {
        let interval = setInterval(() => {
            usage.execute()
        }, 60 * 1000)

        return () => {
            clearInterval(interval)
        }
    }, [usage])

    return (
        <>
            {usage.result && (
                <CardDeck className="mb-3 text-center">
                    <Card>
                        <Card.Header>
                            <Card.Title as="h4">
                                <i className="ti-stats-down text-info" /> Disk space
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title as="h2">
                                {formatBytes(
                                    usage.result.totalDiskSpace - usage.result.freeDiskSpace
                                )}
                                <small className="text-muted">
                                    {' / '}
                                    {formatBytes(usage.result.totalDiskSpace)}
                                </small>
                            </Card.Title>
                            <ProgressBar
                                variant="info"
                                min={0}
                                max={usage.result.totalDiskSpace}
                                now={usage.result.totalDiskSpace - usage.result.freeDiskSpace}
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
                                {formatBytes(usage.result.usedTorrentSpace)}
                                <small className="text-muted">
                                    {' / '}
                                    {formatBytes(
                                        usage.result.freeDiskSpace + usage.result.usedTorrentSpace
                                    )}
                                </small>
                            </Card.Title>
                            <ProgressBar
                                variant="info"
                                min={0}
                                max={usage.result.freeDiskSpace + usage.result.usedTorrentSpace}
                                now={usage.result.usedTorrentSpace}
                            />
                        </Card.Body>
                    </Card>
                </CardDeck>
            )}
        </>
    )
}
