import React from 'react'
import { useGlobal } from 'reactn'
import { Card, CardDeck, ProgressBar } from 'react-bootstrap'
import { formatBytes } from 'common-stuff'

import { DashboardApi } from 'common/api'
import { useAsync } from 'common/hooks'
import { getApiConfig } from 'config'
import { ResultContainer } from 'common/layout'

export function UsageWidget(): JSX.Element {
    const [bearer] = useGlobal('bearer')

    const usage = useAsync(
        async () => {
            return new DashboardApi(getApiConfig({ bearer })).getUsage()
        },
        [],
        {
            refreshInterval: 60 * 1000,
        }
    )

    return (
        <ResultContainer result={usage}>
            {(result) => (
                <CardDeck className="mb-3 text-center">
                    <Card>
                        <Card.Header>
                            <Card.Title as="h4">
                                <i className="ti-stats-down text-info" /> Disk
                                space
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title as="h2">
                                {formatBytes(
                                    result.totalDiskSpace - result.freeDiskSpace
                                )}
                                <small className="text-muted">
                                    {' / '}
                                    {formatBytes(result.totalDiskSpace)}
                                </small>
                            </Card.Title>
                            <ProgressBar
                                variant="info"
                                min={0}
                                max={result.totalDiskSpace}
                                now={
                                    result.totalDiskSpace - result.freeDiskSpace
                                }
                            />
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h4">
                                <i className="ti-stats-down text-warning" />{' '}
                                Torrents space
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title as="h2">
                                {formatBytes(result.usedTorrentSpace)}
                                <small className="text-muted">
                                    {' / '}
                                    {formatBytes(
                                        result.freeDiskSpace +
                                            result.usedTorrentSpace
                                    )}
                                </small>
                            </Card.Title>
                            <ProgressBar
                                variant="info"
                                min={0}
                                max={
                                    result.freeDiskSpace +
                                    result.usedTorrentSpace
                                }
                                now={result.usedTorrentSpace}
                            />
                        </Card.Body>
                    </Card>
                </CardDeck>
            )}
        </ResultContainer>
    )
}
