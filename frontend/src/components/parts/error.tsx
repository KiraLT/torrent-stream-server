import React from 'react'
import { Alert, Button } from 'react-bootstrap'

export function ErrorComponent({
    error,
    retry,
}: {
    error: Error
    retry?: () => Promise<unknown>
}): JSX.Element {
    const [part1 = '', part2] = error.message.split(': ', 2)

    return (
        <Alert variant="danger mt-2">
            <div className="d-flex justify-content-between">
                <div className="align-self-center">
                    {part2 ? (
                        <>
                            <strong>{part1}: </strong> {part2}
                        </>
                    ) : (
                        part1
                    )}
                </div>
                {retry && (
                    <div className="align-self-center">
                        <Button variant="primary" onClick={() => retry().catch(() => undefined)}>
                            Retry
                        </Button>
                    </div>
                )}
            </div>
        </Alert>
    )
}
