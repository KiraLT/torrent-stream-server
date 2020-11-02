import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'timeago.js'

import { DashboardApi, TorrentsApi, Torrent, Usage } from '../helpers/client'
import { formatBytes, parseError } from '../helpers'
import { getApiConfig } from '../config'
import { withBearer } from './parts/auth'

export const DashboardComponent = withBearer(({ bearer }) => {
    const [torrents, setTorrents] = useState<Torrent[]>()
    const [usage, setUsage] = useState<Usage>()
    const [error, setError] = useState('')

    const updateTorrents = async () => new TorrentsApi(getApiConfig({ bearer })).getTorrents().then(v => setTorrents(v)).catch(async err =>{
        setError(await parseError(err))
    })
    const updateUsage = async () => new DashboardApi(getApiConfig({ bearer })).getUsage().then(v => setUsage(v)).catch(async err => {
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

    return <div className="container">
        {error && <div className="alert alert-danger" role="alert">
            {error}
        </div>}
        {!torrents && !error && <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>}
        {usage && <div className="card-deck mb-3 text-center">
            <div className="card mb-4 box-shadow">
                <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Disk space</h4>
                </div>
                <div className="card-body">
                    <h2 className="card-title pricing-card-title">
                        {formatBytes(usage.totalDiskSpace - usage.freeDiskSpace)}
                        <small className="text-muted">/ {formatBytes(usage.totalDiskSpace)}</small>
                    </h2>
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" style={{
                            width: `${((usage.totalDiskSpace - usage.freeDiskSpace) / usage.totalDiskSpace * 100)}%`
                        }}></div>
                    </div>
                </div>
            </div>
            <div className="card mb-4 box-shadow">
                <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Torrents space</h4>
                </div>
                <div className="card-body">
                    <h2 className="card-title pricing-card-title">
                        {formatBytes(usage.usedTorrentSpace)}
                        <small className="text-muted">/ {formatBytes(usage.freeDiskSpace + usage.usedTorrentSpace)}</small>
                    </h2>
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" style={{
                            width: `${usage.usedTorrentSpace / (usage.freeDiskSpace + usage.usedTorrentSpace) * 100}%`
                        }}></div>
                    </div>
                </div>
            </div>
        </div>}
        {torrents && <>
            {torrents.length ? <>
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
                        {torrents.map(torrent => <>
                            <tr>
                                <td>{torrent.name}</td>
                                <td>{formatBytes(torrent.downloaded)} ({formatBytes(torrent.downloadSpeed)}/s)</td>
                                <td>{format(torrent.started)}</td>
                                <td><Link to={`/play?torrent=${encodeURIComponent(torrent.link)}`} className="btn btn-outline-primary ti-control-play"></Link></td>
                            </tr>
                        </>)}
                    </tbody>
                </table>
            </> : <div className="alert alert-warning" role="alert">
                No active torrents at the moment
            </div>}
        </>}
    </div>
})
