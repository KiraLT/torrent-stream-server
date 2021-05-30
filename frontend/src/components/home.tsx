import React, { useState } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { Card, Button, Form, Row, Col, Container, ListGroup } from 'react-bootstrap'
import { useForm, SubmitHandler } from 'react-hook-form'

import { getHistoryItems, removeHistoryItem } from '../helpers/history'
import { withBearer } from './parts/auth'

interface Inputs {
    torrent: string
}

export const HomeComponent = withBearer((): JSX.Element => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>()
    const history = useHistory()

    const onSubmit: SubmitHandler<Inputs> = ({ torrent }) => {
        history.push(`/play?torrent=${encodeURIComponent(torrent.trim())}`)
    }

    return (
        <Container className="mt-3">
            <Card>
                <Card.Header>
                    <Card.Title as="h3">
                        <i className="ti-control-play text-success" /> Stream torrents
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            <Col sm={8}>
                                <Form.Control
                                    placeholder="Torrent file or magnet link"
                                    className="mb-2"
                                    {...register('torrent', { required: true })}
                                    isInvalid={!!errors.torrent}
                                />
                            </Col>
                            <Col sm={4}>
                                <Button variant="secondary" className="w-100 mb-2" type="submit">
                                    Stream
                                </Button>
                            </Col>
                        </Row>
                    </form>
                </Card.Body>
            </Card>

            <HistoryComponent />
        </Container>
    )
})

function HistoryComponent(): JSX.Element {
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
        </>
    )
}
