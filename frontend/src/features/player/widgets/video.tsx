import React, { useEffect, useRef, memo } from 'react'
import { Alert } from 'react-bootstrap'
import isMobile from 'ismobilejs'
import videojs from 'video.js'

const chromecast = require('@silvermine/videojs-chromecast')
chromecast(videojs)

export const VideoPlayerWidget = memo(({
    url,
    type,
}: {
    url: string
    type: string
}) => {
    const device = isMobile(window.navigator)
    const ref = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (ref.current) {
            console.log('CREATING', ref.current, url)
            const v = videojs(ref.current, {
                controls: true,
                sources: [
                    {
                        type: type === 'video/x-matroska' ? 'video/mp4' : type,
                        src: url,
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
    }, [url, type])

    return (
        <>
            <div data-vjs-player key={url}>
                <video
                    ref={ref}
                    className="video-js vjs-theme-custom vjs-big-play-centered"
                ></video>
            </div>
            {type === 'video/x-matroska' && (
                <Alert variant="warning" className="mt-2">
                    Browser does not support Matroska subtitles, it's
                    recommended to use native player.
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
                            click Media {'>'} Open Network Stream and paste
                            stream link (or download playlist below and open it
                            with VLC).
                        </>
                    )}
                </Alert>
            )}
        </>
    )
})
