import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Row, Col, ListGroup } from 'react-bootstrap'

import { getHistoryItems, removeHistoryItem } from './utils'

export function HistoryWidget(): JSX.Element {
    const [historyItems, setHistoryItems] = useState(getHistoryItems())

    return (
        <>
            {historyItems.length > 0 && (
                <Card>
                    <Card.Header>
                        <Card.Title as="h3">
                            <i className="ti-pin-alt text-info" /> History
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush">
                            {historyItems.map((item, i) => (
                                <ListGroup.Item
                                    key={i}
                                    className="bg-transparent border-dark"
                                >
                                    <Row>
                                        <Col xs className="d-flex mb-2">
                                            <span className="justify-content-center align-self-center text-break">
                                                {item.name}
                                            </span>
                                        </Col>
                                        <Col sm="auto" className="d-flex mb-2">
                                            <span className="justify-content-end align-self-center ml-auto">
                                                <Button
                                                    as={Link}
                                                    to={`/play?torrent=${encodeURIComponent(
                                                        item.link
                                                    )}`}
                                                    className="ti-control-play pr-4 pl-4"
                                                    variant="success"
                                                ></Button>
                                                <Button
                                                    className="ti-close ml-1 pr-4 pl-4"
                                                    variant="warning"
                                                    onClick={() => {
                                                        removeHistoryItem(item)
                                                        setHistoryItems(
                                                            getHistoryItems()
                                                        )
                                                    }}
                                                >
                                                    {' '}
                                                </Button>
                                            </span>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}
        </>
    )
}
