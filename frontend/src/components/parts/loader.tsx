import React from 'react'
import { Spinner } from 'react-bootstrap'

export function LoaderComponent(): JSX.Element {
    return <div className="text-center mt-5">
        <Spinner animation="border"/>
    </div>
}
