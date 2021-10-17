import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobal } from 'reactn'
import { Card, Alert, ListGroup, Row, Col, Button } from 'react-bootstrap'
import { formatBytes } from 'common-stuff'

import { TorrentsApi } from 'common/api'
import { ResultContainer } from 'common/layout'
import { formatDate } from 'common/utils'
import { useAsync } from 'common/hooks'
import { getApiConfig } from 'config'

export function ActiveTorrentsWidget(): JSX.Element {
    const [bearer] = useGlobal('bearer')

    const torrents = useAsync(
        async () => new TorrentsApi(getApiConfig({ bearer })).getTorrents(),
        [bearer],
        {
            refreshInterval: 5 * 1000,
        }
    )

    return (
        <ResultContainer result={torrents}>
            {(result) => (
                <>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h3">
                                <i className="ti-bar-chart text-info" />{' '}
                                Activity
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {result.length === 0 && <Alert variant="warning">
                                    No active torrents at the moment
                                </Alert>}
                                {result.map((torrent) => (
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
                                            <Col
                                                lg={4}
                                                className="d-flex mb-2"
                                            >
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
                                                                new Date(
                                                                    torrent.started
                                                                )
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
                </>
            )}
        </ResultContainer>
    )
}
