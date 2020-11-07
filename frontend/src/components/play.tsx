import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import isMobile from 'ismobilejs'

import { TorrentsApi, Torrent, TorrentFile } from '../helpers/client'
import { getApiConfig, apiDomain } from '../config'
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

    const torrentFile = torrent?.files.find((v) => v.path === file)

    useEffect(() => {
        const action = async () => {
            if (link) {
                const newTorrent = await new TorrentsApi(getApiConfig({ bearer })).createTorrent({
                    torrent: link,
                })
                setTorrent(newTorrent)
                addHistoryItem({
                    name: newTorrent.name,
                    link: newTorrent.link,
                })
            } else {
                setError('Torrent link is not specified')
            }
        }
        action().catch(async (err) => {
            setError(await parseError(err))
        })
    }, [link, bearer])

    return (
        <div className="container">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            {!torrent && !error && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
            {torrent && link && (
                <>
                    <h3>
                        <small>{torrent.name}</small>
                    </h3>
                    {!file ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Size</th>
                                    <th>Play</th>
                                    <th>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortBy(torrent.files, (v) => v.name).map((v) => (
                                    <tr>
                                        <td>
                                            {v.path
                                                .split('/')
                                                .map((part, index, arr) =>
                                                    index + 1 < arr.length ? (
                                                        <span className="text-muted">
                                                            {part} /{' '}
                                                        </span>
                                                    ) : (
                                                        part
                                                    )
                                                )}
                                        </td>
                                        <td>{formatBytes(v.length)}</td>
                                        <td>
                                            <Link
                                                to={`?torrent=${encodeURIComponent(
                                                    link
                                                )}&file=${encodeURIComponent(v.path)}`}
                                                className="btn btn-outline-primary ti-control-play"
                                            ></Link>
                                        </td>
                                        <td>
                                            <a
                                                href={apiDomain + v.stream}
                                                className="btn btn-outline-primary ti-cloud-down"
                                            >
                                                {' '}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <>
                            <h5 className="text-muted">
                                <small>{file}</small>
                                {torrentFile && (
                                    <a
                                        href={apiDomain + torrentFile.stream}
                                        className="btn ti-cloud-down text-primary"
                                    >
                                        {' '}
                                    </a>
                                )}{' '}
                                - <Link to={`?torrent=${encodeURIComponent(link)}`}>view all</Link>
                            </h5>
                        </>
                    )}
                    {file && link && torrentFile && (
                        <>
                            <TorrentFileComponent file={torrentFile} />
                            <br />
                            <div className="form-group">
                                <input
                                    className="form-control"
                                    value={apiDomain + torrentFile.stream}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
})

function TorrentFileComponent({ file }: { file: TorrentFile }): JSX.Element {
    if (file.type.includes('video')) {
        return <VideoPlayerComponent video={apiDomain + file.stream} type={file.type} />
    }
    if (file.type.includes('image')) {
        return <ImageComponent image={apiDomain + file.stream} name={file.name} />
    }
    if (file.type.includes('text')) {
        return <TextComponent text={apiDomain + file.stream} />
    }
    return (
        <div>
            <Alert variant="warning">
                Unknown file type: {file.type}
                <a
                    href={apiDomain + file.stream}
                    className="btn btn-outline-primary ti-cloud-down ml-5"
                >
                    Direct link
                </a>
            </Alert>
        </div>
    )
}

function ImageComponent({ image, name }: { image: string; name: string }): JSX.Element {
    return (
        <div className="w-100 text-center">
            <img src={image} alt={name} />
        </div>
    )
}

function TextComponent({ text }: { text: string }): JSX.Element {
    const [value, setValue] = useState<string>()

    useEffect(() => {
        fetch(text).then(async (v) => setValue(await v.text()))
    })

    return (
        <div className="card card-body" style={{ maxHeight: '500px' }}>
            {value === undefined && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
            <pre>{value}</pre>
        </div>
    )
}

function VideoPlayerComponent({ video, type }: { video: string; type: string }): JSX.Element {
    const device = isMobile(window.navigator)

    return <>
        {type === 'video/x-matroska' && <Alert variant="warning" className="mt-2">
                Browser does not support Matroska subtitles, it's recommended to use native player.<br />
            {device.any ? <>
                {device.android.device && <>
                    In <a href="https://play.google.com/store/apps/details?id=com.mxtech.videoplayer.ad" target="_blank" rel="noreferrer">MX Player</a> click Network stream and paste stream link.
                </>}
            </> : <>
                In <a href="https://www.videolan.org/vlc/index.html" target="_blank" rel="noreferrer">VLC</a> click Media {'>'} Open Network Stream and paste stream link.
            </>}
        </Alert>}
        <div className="embed-responsive embed-responsive-16by9">
            <video width="720" controls>
                <source src={video} />
                Your browser does not support HTML5 video.
            </video>
        </div>
    </>
}
