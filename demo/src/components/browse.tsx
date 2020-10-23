import React, { useState, useEffect } from 'react'
import { Container, Row, Col, FormControl, Alert, Button, InputGroup, Form, Table } from 'react-bootstrap'
import { getProviders, BrowseProvider, BrowseTorrent, searchTorrents } from '../helpers/client'
import { useSearchParam, useSearchParamsHandler } from '../helpers/hooks'
import { Link } from 'react-router-dom'

export function BrowseComponent(): JSX.Element {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [providers, setProviders] = useState<BrowseProvider[]>([])
    const [torrents, setTorrents] = useState<BrowseTorrent[]>([])

    const handler = useSearchParamsHandler()
    const provider = useSearchParam('provider') ?? ''
    const category = useSearchParam('category') ?? ''
    const query = useSearchParam('query') ?? ''

    useEffect(() => {
        const doAction = async () => {
            setProviders(await getProviders())
        }
        doAction().catch(err => setError(String(err)))
    }, [])

    useEffect(() => {
        const doAction = async () => {
            setError('')
            if (provider && category && query) {
                try {
                    setLoading(true)
                    setTorrents(await searchTorrents(provider, query, category))
                } finally {
                    setLoading(false)
                }
            }
        }
        doAction().catch(err => setError(String(err)))
    }, [provider, query, category])

    const providerNames = providers.map(v => v.name).sort()
    const categories = provider ? providers.find(v => v.name === provider)?.categories ?? [] : []

    return <Container>
        {error && <Alert variant="danger">
            {error}
        </Alert>}
        <Form onSubmit={event => {
            event.preventDefault()
            const formQuery = new FormData(event.target as HTMLFormElement).get('query') 
            handler({
                set: {
                    query: typeof formQuery === 'string' ? formQuery : ''
                }
            })
        }}>
            <Row>
                <Col sm className="mt-2">
                    <Row>
                        <Col>
                            <FormControl as="select" value={provider} onChange={event => {
                                handler({
                                    set: {
                                        provider: event.target.value
                                    },
                                    delete: ['category', 'query']
                                })
                            }}>
                                <option value="">-- select provider --</option>
                                {providerNames.map(v => <option key={v} value={v}>{v}</option>)}
                            </FormControl>
                        </Col>
                        <Col>
                            <FormControl as="select" value={category} onChange={event => {
                                handler({
                                    set: {
                                        category: event.target.value
                                    },
                                    delete: ['query']
                                })
                            }} disabled={!provider}>
                                <option value="">-- select category --</option>
                                {categories.map(v => <option key={v} value={v}>{v}</option>)}
                            </FormControl>
                        </Col>
                    </Row>
                </Col>
                <Col sm className="mt-2">
                    <InputGroup>
                        <FormControl disabled={!category || !provider} defaultValue={query} type="search" placeholder="Search..." name="query"/>
                        <InputGroup.Append>
                            <Button
                                disabled={!category || !provider}
                                variant="outline-primary"
                                type="submit"
                            ><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2="16.65" y2="16.65" /></svg></Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Col>
            </Row>
        </Form>
        {loading && <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>}
        {!loading && <Table className="mt-3">
            <tbody>
                {torrents.map(torrent => <>
                    <tr>
                        <td>{torrent.name}</td>
                        <td className="text-right" style={{whiteSpace: 'nowrap'}}>{torrent.size}</td>
                        <td className="text-right" style={{whiteSpace: 'nowrap'}}>
                            {torrent.time}
                        </td>
                        <td className="text-right" style={{whiteSpace: 'nowrap'}}>
                            {torrent.seeds != null && <span className="text-success">
                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><line x1={12} y1={19} x2={12} y2={5} /><polyline points="5 12 12 5 19 12" /></svg>
                                {torrent.seeds}
                            </span>}
                            {' '}
                            {torrent.peers != null && <span className="text-danger">
                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-down"><line x1={12} y1={5} x2={12} y2={19} /><polyline points="19 12 12 19 5 12" /></svg>
                                {torrent.peers}
                            </span>}
                            {' '}
                        </td>
                        <td className="text-right" style={{whiteSpace: 'nowrap'}}>
                            {torrent.downloads != null && <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1={12} y1={15} x2={12} y2={3} /></svg>
                                {torrent.downloads}
                            </span>}
                        </td>
                        <td className="text-right"><Link to={`/play?torrent=${encodeURIComponent(torrent.magnet)}`} className="btn btn-outline-primary ti-control-play"></Link></td>
                    </tr>
                </>)}
            </tbody>
        </Table>}
    </Container>
}
