import React, { useMemo, useEffect, memo } from 'react'
import { Modal, Alert } from 'react-bootstrap'
import { generateUUID } from 'common-stuff'

export function GoogleDrivePopupWidget({
    url,
    name,
    open,
    onClose,
}: {
    url: string
    name: string
    open: boolean
    onClose: () => void
}) {
    return (
        <>
            <Modal show={open} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload to Google Drive</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <GoogleDriveWidget name={name} url={url} />
                </Modal.Body>
            </Modal>
        </>
    )
}

export const GoogleDriveWidget = memo(
    ({ name, url }: { name: string; url: string }) => {
        const scriptUrl = 'https://apis.google.com/js/platform.js'

        const id = useMemo(() => generateUUID(), [])

        useEffect(() => {
            const callback = () => {
                const gapi = (window as any).gapi

                gapi.savetodrive.render(id, {
                    src: url,
                    filename: name,
                    sitename: document.title,
                })
            }

            if (document.querySelector(`[src="${scriptUrl}"]`)) {
                callback()
            } else {
                const tag = document.createElement('script')
                tag.type = 'text/javascript'
                tag.src = scriptUrl
                tag.onload = callback

                document.body.appendChild(tag)
            }
        }, [url, name, id])

        return (
            <>
                <Alert variant="info">
                    Click on button below to start uploading. Closing popup will
                    cancel upload process!
                </Alert>
                <div className="d-flex justify-content-center">
                    <div id={id} key={id} />
                </div>
            </>
        )
    }
)
