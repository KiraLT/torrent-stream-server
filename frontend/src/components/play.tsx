import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'

import { TorrentsApi, Torrent } from '../helpers/client'
import { getSteamUrl, getApiConfig } from '../config'
import { formatBytes, sortBy, parseError } from '../helpers'
import { addHistoryItem } from '../helpers/history'
import { withBearer } from './parts/auth'

export const PlayComponent = withBearer(({ bearer }) => {
    const [torrent, setTorrent] = useState<Torrent>()
    const [error, setError] = useState('')
    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)
    const link = searchParams.get('torrent')
    const file = searchParams.get('file')

    useEffect(() => {
        const action = async () => {
            if (link) {
                const newTorrent = await new TorrentsApi(getApiConfig({ bearer })).createTorrent({ torrent: link })
                setTorrent(newTorrent)
                addHistoryItem({
                    name: newTorrent.name,
                    link: newTorrent.link,
                })
            } else {
                setError('Torrent link is not specified')
            }
        }
        action().catch(async err => {
            setError(await parseError(err))
        })
    }, [link, bearer])

    return <div className="container">
        {error && <div className="alert alert-danger" role="alert">
            {error}
        </div>}
        {!torrent && !error && <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>}
        {torrent && link && <>
            <h3><small>{torrent.name}</small></h3>
            {!file ? <table className="table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Size</th>
                        <th>Play</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {sortBy(torrent.files, v => v.name).map(v => <tr>
                        <td>
                            {v.path.split('/').map((part, index, arr) => index + 1 < arr.length ? <span className='text-muted'>{part} / </span>: part)}
                        </td>
                        <td>
                            {formatBytes(v.length)}
                        </td>
                        <td>
                            <Link to={`?torrent=${encodeURIComponent(link)}&file=${encodeURIComponent(v.path)}`} className="btn btn-outline-primary ti-control-play"></Link>
                        </td>
                        <td>
                            <a href={getSteamUrl(link, v.path)} className="btn btn-outline-primary ti-cloud-down">{' '}</a>
                        </td>
                    </tr>)}
                </tbody>
            </table> : <>
                <h5 className="text-muted"><small>{file}</small><a href={`${getSteamUrl(link, file)}`} className="btn ti-cloud-down text-primary">{' '}</a> - <Link to={`?torrent=${encodeURIComponent(link)}`}>view all</Link></h5>
            </>}
            {file && link && <>
                <div className="embed-responsive embed-responsive-16by9">
                    <video width="720" controls>
                        <source src={getSteamUrl(link, file)} type="video/mp4" />
                        Your browser does not support HTML5 video.
                    </video>
                </div>
                <br />
                <div className="form-group">
                    <input className="form-control" value={getSteamUrl(link, file)} />
                </div>
            </>}
        </>}
    </div>
})
