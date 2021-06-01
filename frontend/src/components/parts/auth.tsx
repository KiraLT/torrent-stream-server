import React, { ComponentType, useEffect, useState } from 'react'
import { useGlobal } from 'reactn'
import { Container, Form, Col, Button, Alert } from 'react-bootstrap'

import { AuthApi } from '../../helpers/client'
import { getApiConfig } from '../../config'
import { parseError } from '../../helpers'

export function withBearer<T>(Component: ComponentType<T & { bearer?: string }>): ComponentType<T> {
    return (props) => {
        const [bearerRequired, setBearerRequired] = useGlobal('bearerRequired')
        const [bearer, setBearer] = useGlobal('bearer')
        const [error, setError] = useState('')

        useEffect(() => {
            if (bearerRequired === undefined) {
                new AuthApi(getApiConfig())
                    .auth()
                    .then(() => {
                        setBearerRequired(false)
                    })
                    .catch(async (err) => {
                        if (err instanceof Response && err.status === 401) {
                            setBearerRequired(true)
                        } else {
                            setError(await parseError(err))
                        }
                    })
            }
        }, [bearerRequired, setBearerRequired])

        if (bearerRequired === undefined) {
            return error ? (
                <Container>
                    <Alert variant="danger" className="mt-2">
                        {error}
                    </Alert>
                </Container>
            ) : (
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )
        }

        if ((bearerRequired && bearer) || !bearerRequired) {
            return <Component bearer={bearer} {...props} />
        }

        return (
            <Container>
                <h2 className="mt-5">Authorization</h2>
                {!!error && (
                    <Alert variant="danger" className="mt-2">
                        {error}
                    </Alert>
                )}
                {!error && (
                    <Alert variant="warning" className="mt-2">
                        Authorization is required to access this page
                    </Alert>
                )}
                <Form
                    onSubmit={(event) => {
                        event.preventDefault()
                        const value = new FormData(event.target as HTMLFormElement).get('key')

                        if (typeof value === 'string') {
                            new AuthApi(getApiConfig({ bearer: value }))
                                .auth()
                                .then(() => {
                                    setBearer(value)
                                })
                                .catch(() => {
                                    setError('Failed to authorize')
                                })
                        }
                    }}
                >
                    <Form.Row>
                        <Col>
                            <Form.Control placeholder="Key" type="password" name="key" />
                        </Col>
                        <Col>
                            <Button type="submit" variant="primary" className="w-100">
                                Authorize
                            </Button>
                        </Col>
                    </Form.Row>
                </Form>
            </Container>
        )
    }
}
