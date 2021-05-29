import React from 'react'
import { Alert, Button } from 'react-bootstrap'

export function ErrorComponent({error, retry}: {error: Error, retry?: () => Promise<unknown>}): JSX.Element {
    return <Alert variant="danger mt-2">
        <div className="d-flex justify-content-between">
            <div className="align-self-center">
                {error.message}
            </div>
            {retry && <div className="align-self-center">
                <Button variant="primary" onClick={() => retry().catch(() => undefined)}>
                    Retry
                </Button>
            </div>}
        </div>
    </Alert>
}
