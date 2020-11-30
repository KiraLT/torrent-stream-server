import React, { useState } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { Card, Button, Form, Row, Col, Container, ListGroup } from 'react-bootstrap'

import { getHistoryItems, removeHistoryItem } from '../helpers/history'
import { withBearer } from './parts/auth'

export const HomeComponent = withBearer(
    (): JSX.Element => {
        const [input, setInput] = useState('')
        const [historyItems, setHistoryItems] = useState(getHistoryItems())
        const history = useHistory()

        return (
            <Container className="mt-3">
                <Card>
                    <Card.Header>
                        <Card.Title as="h3">
                            <i className="ti-control-play text-success" /> Create torrent stream
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col sm={8}>
                                <Form.Control
                                    placeholder="Torrent file or magnet link"
                                    className="mb-2"
                                    value={input}
                                    onChange={(event) => {
                                        setInput(event.target.value)
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <Button
                                    variant="secondary"
                                    className="w-100 mb-2"
                                    onClick={() => {
                                        if (input.trim()) {
                                            history.push(
                                                `/play?torrent=${encodeURIComponent(input)}`
                                            )
                                        }
                                    }}
                                >
                                    Stream
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

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
                                    <ListGroup.Item key={i} className="bg-transparent border-dark">
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
                                                            setHistoryItems(getHistoryItems())
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
            </Container>
        )
    }
)
