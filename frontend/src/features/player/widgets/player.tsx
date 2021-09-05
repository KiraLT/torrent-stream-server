import React, { memo } from 'react'
import { Alert } from 'react-bootstrap'

import { VideoPlayerWidget } from './video'
import { TextPlayerWidget } from './text'
import { ImagePlayerWidget } from './image'

export const FilePlayerWidget = memo(
    ({ url, type, name }: { url: string; type: string; name: string }) => {
        if (type.includes('video') || type.includes('audio')) {
            return <VideoPlayerWidget url={url} type={type} />
        }
        if (type.includes('image')) {
            return <ImagePlayerWidget url={url} name={name} />
        }
        if (type.includes('text')) {
            return <TextPlayerWidget url={url} />
        }
        return (
            <div>
                <Alert variant="warning">
                    Unknown file type: {type}
                    <a
                        href={url}
                        className="btn btn-outline-primary ti-cloud-down ml-5"
                    >
                        Direct link
                    </a>
                </Alert>
            </div>
        )
    }
)
