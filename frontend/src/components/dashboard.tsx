import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Alert, CardDeck, ProgressBar, Container } from 'react-bootstrap'

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
            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}
            {!torrents && !error && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
            {usage && (
                <CardDeck className="mb-3 text-center">
                    <Card>
                        <Card.Header>
                            <Card.Title as="h3">
                                Disk space
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
                            <Card.Title as="h3">
                                Torrents space
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
                        <>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Download</th>
                                        <th>Created</th>
                                        <th>Play</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {torrents.map((torrent) => (
                                        <>
                                            <tr>
                                                <td className="text-break">{torrent.name}</td>
                                                <td>
                                                    {formatBytes(torrent.downloaded)} (
                                                    {formatBytes(torrent.downloadSpeed)}
                                                    /s)
                                                </td>
                                                <td>{formatDate(new Date(torrent.started))}</td>
                                                <td>
                                                    <Link
                                                        to={`/play?torrent=${encodeURIComponent(
                                                            torrent.link
                                                        )}`}
                                                        className="btn btn-outline-primary ti-control-play"
                                                    ></Link>
                                                </td>
                                            </tr>
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <Alert variant="warning">
                            No active torrents at the moment
                        </Alert>
                    )}
                </>
            )}
        </Container>
    )
})
