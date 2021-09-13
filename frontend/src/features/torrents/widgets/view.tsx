import React, { useState } from 'react'
import { Card, Row, Col, DropdownButton, Dropdown } from 'react-bootstrap'

import { TorrentFileModel, TorrentModel } from 'common/api'
import { FilePlayerWidget } from 'features/player'
import { GoogleDrivePopupWidget } from 'features/storage'
import { formatFileName } from '../utils'

export function TorrentViewWidget({
    file,
    torrent,
}: {
    file: TorrentFileModel
    torrent: TorrentModel
}): JSX.Element {
    const [gdriveOpen, setGdriveOpen] = useState(false)

    return (
        <>
            <GoogleDrivePopupWidget
                url={file.stream}
                name={file.name}
                open={gdriveOpen}
                onClose={() => setGdriveOpen(false)}
            />
            <FilePlayerWidget
                url={file.stream}
                name={file.name}
                type={file.type}
            />
            <Card className="mt-3">
                <Card.Header>
                    <Row className="">
                        <Col sm className="d-flex">
                            <span className="justify-content-center align-self-center">
                                <h5 className="text-break card-category">
                                    {torrent.name}
                                </h5>
                                <Card.Title as="h4" className="text-break">
                                    {formatFileName(file.path, torrent.name)}
                                </Card.Title>
                            </span>
                        </Col>
                        <Col sm="auto" className="d-flex mb-3">
                            <DropdownButton
                                title="Download"
                                variant="success"
                                className="w-100 justify-content-center align-self-center"
                            >
                                <Dropdown.Item
                                    eventKey="1"
                                    as={'a'}
                                    href={file.stream}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <i className="ti-cloud-down"></i> Download
                                </Dropdown.Item>
                                <Dropdown.Item
                                    eventKey="1"
                                    as={'a'}
                                    href={file.streamZip}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <i className="ti-zip"></i> Download as zip
                                </Dropdown.Item>
                                <Dropdown.Item
                                    eventKey="2"
                                    className="g-savetodrive"
                                    id="save-to-google-cloud"
                                    onSelect={() => setGdriveOpen(true)}
                                >
                                    <i className="ti-google"></i> Save to google
                                    drive
                                </Dropdown.Item>
                            </DropdownButton>
                        </Col>
                    </Row>
                </Card.Header>
            </Card>
        </>
    )
}
