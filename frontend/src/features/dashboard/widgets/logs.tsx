import React, { useMemo } from 'react'
import { useGlobal } from 'reactn'
import { Card, Row, Col, ListGroup, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap'

import { DashboardApi, LogLevelEnum, Log } from 'common/api'
import { useAsync } from 'common/hooks'
import { getApiConfig } from 'config'
import { ResultContainer } from 'common/layout'
import { generateUUID } from 'common-stuff'

export function LogsWidget(): JSX.Element {
    const [bearer] = useGlobal('bearer')

    const logs = useAsync(
        async () => {
            return new DashboardApi(getApiConfig({ bearer })).getLogs()
        },
        [],
        {
            refreshInterval: 5 * 1000,
        }
    )

    return (
        <ResultContainer result={logs}>
            {(result) => (
                <Card>
                    <Card.Header>
                        <Card.Title as="h3">
                            <i className="ti-alert text-info" />{' '}
                            Logs
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <ListGroup variant="flush" style={{
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            {result.length === 0 && <Alert variant="warning">
                                No logs at the moment
                            </Alert>}
                            {result.map((log, i) => (
                                <LogEntry log={log} key={i}/>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            )}
        </ResultContainer>
    )
}

function LogEntry({ log }: { log: Log }): JSX.Element {
    const date = new Date(log.time * 1000)

    const id = useMemo(() => generateUUID(), [])

    return <ListGroup.Item
        className="bg-transparent border-dark"
    >
        <Row>
            <Col xs={6} lg={3} xl={2} className="d-flex mb-2">
                <OverlayTrigger
                    overlay={
                        <Tooltip id={id}>
                            {date.toString()}
                        </Tooltip>
                    }
                >
                <span className="justify-content-center align-self-center">
                    {date.toISOString().replace('T', ' ').split('.')[0]}
                </span>
                </OverlayTrigger>
            </Col>
            <Col xs={6} lg={1} xl={1} className="d-flex mb-2">
                <span className="justify-content-center align-self-center">
                    {log.level === LogLevelEnum.Debug && <span className="text-primary">DEBUG</span>}
                    {log.level === LogLevelEnum.Info && <span className="text-success">INFO</span>}
                    {log.level === LogLevelEnum.Warn && <span className="text-warning">WARNING</span>}
                    {log.level === LogLevelEnum.Error && <span className="text-danger">ERROR</span>}
                </span>
            </Col>
            <Col lg={7} xl={9} className="d-flex mb-2">
                <span className="justify-content-center align-self-center text-break">
                    {log.message.split('\n').map(v => <div>{v}</div>)}
                </span>
            </Col>
        </Row>
    </ListGroup.Item>
}