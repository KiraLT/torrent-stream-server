import React from 'react'
import { Spinner } from 'react-bootstrap'

export function LoaderComponent(): JSX.Element {
    return (
        <div className="d-flex justify-content-center mt-5">
            <Spinner animation="border" />
        </div>
    )
}
