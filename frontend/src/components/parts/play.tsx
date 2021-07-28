import React, { useEffect, useState, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import isMobile from 'ismobilejs'
import videojs from 'video.js'

import { TorrentFileModel } from '../../helpers/client'

const chromecast = require('@silvermine/videojs-chromecast')
chromecast(videojs)

export function TorrentFileComponent({ file }: { file: TorrentFileModel }): JSX.Element {
    if (file.type.includes('video') || file.type.includes('audio')) {
        return <VideoPlayerComponent video={file.stream} type={file.type} />
    }
    if (file.type.includes('image')) {
        return <ImageComponent image={file.stream} name={file.name} />
    }
    if (file.type.includes('text')) {
        return <TextComponent text={file.stream} />
    }
    return (
        <div>
            <Alert variant="warning">
                Unknown file type: {file.type}
                <a href={file.stream} className="btn btn-outline-primary ti-cloud-down ml-5">
                    Direct link
                </a>
            </Alert>
        </div>
    )
}

export function ImageComponent({ image, name }: { image: string; name: string }): JSX.Element {
    return (
        <div className="w-100 text-center">
            <img src={image} alt={name} />
        </div>
    )
}

export function TextComponent({ text }: { text: string }): JSX.Element {
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

export function VideoPlayerComponent({
    video,
    type,
}: {
    video: string
    type: string
}): JSX.Element {
    const device = isMobile(window.navigator)
    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (ref.current) {
            const v = videojs(ref.current, {
                controls: true,
                sources: [
                    {
                        type: type === 'video/x-matroska' ? 'video/mp4' : type,
                        src: video,
                    },
                ],
                fluid: true,
                preload: 'auto',
                techOrder: ['chromecast', 'html5'],
                plugins: {
                    chromecast: {
                        buttonPositionIndex: 2,
                    },
                },
                ...{
                    userActions: {
                        doubleClick: true,
                        hotkeys: true,
                    },
                },
            })

            // Skip a bit to load poster
            v.currentTime(1)

            return () => {
                v.dispose()
            }
        }
    })

    return (
        <>
            <div data-vjs-player>
                <video
                    ref={ref}
                    className="video-js vjs-theme-custom vjs-big-play-centered"
                ></video>
            </div>
            {type === 'video/x-matroska' && (
                <Alert variant="warning" className="mt-2">
                    Browser does not support Matroska subtitles, it's recommended to use native
                    player.
                    <br />
                    {device.any ? (
                        <>
                            {device.android.device && (
                                <>
                                    In{' '}
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.mxtech.videoplayer.ad"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        MX Player
                                    </a>{' '}
                                    click Network stream and paste stream link.
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            In{' '}
                            <a
                                href="https://www.videolan.org/vlc/index.html"
                                target="_blank"
                                rel="noreferrer"
                            >
                                VLC
                            </a>{' '}
                            click Media {'>'} Open Network Stream and paste stream link (or download
                            playlist below and open it with VLC).
                        </>
                    )}
                </Alert>
            )}
        </>
    )
}
