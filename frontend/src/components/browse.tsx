import React, { useState, useEffect, Fragment } from 'react'
import { Link, useHistory } from 'react-router-dom'
import {
    Row,
    Col,
    FormControl,
    Alert,
    Button,
    InputGroup,
    Form,
    Table,
    Badge,
    Container,
} from 'react-bootstrap'

import { BrowseApi, ProviderModel, ProviderTorrentModel } from '../helpers/client'
import { useSearchParam, useSearchParamsHandler } from '../helpers/hooks'
import { parseError, formatDate } from '../helpers'
import { withBearer } from './parts/auth'
import { getApiConfig } from '../config'
import { AsyncButton } from './parts/button'

export const BrowseComponent = withBearer(({ bearer }) => {
    const history = useHistory()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [providers, setProviders] = useState<ProviderModel[]>([])
    const [torrents, setTorrents] = useState<ProviderTorrentModel[]>()

    const handler = useSearchParamsHandler()
    const provider = useSearchParam('provider') ?? ''
    const category = useSearchParam('category') ?? ''
    const query = useSearchParam('query') ?? ''

    useEffect(() => {
        const doAction = async () => {
            setProviders(await new BrowseApi(getApiConfig({ bearer })).getProviders())
        }
        doAction().catch(async (err) => setError(await parseError(err)))
    }, [bearer])

    const canSearch = provider && query

    useEffect(() => {
        const doAction = async () => {
            setError('')
            if (canSearch) {
                try {
                    setLoading(true)
                    setTorrents(
                        await new BrowseApi(getApiConfig({ bearer })).searchTorrents({
                            provider,
                            query,
                            category,
                        })
                    )
                } finally {
                    setLoading(false)
                }
            }
        }
        doAction().catch(async (err) => setError(await parseError(err)))
    }, [provider, query, category, canSearch, bearer])

    const providerNames = providers.map((v) => v.name).sort()
    const categories = provider ? providers.find((v) => v.name === provider)?.categories ?? [] : []

    return (
        <Container className="mt-3">
            <Form
                onSubmit={(event) => {
                    event.preventDefault()
                    const formQuery = new FormData(event.target as HTMLFormElement).get('query')
                    handler({
                        set: {
                            query: typeof formQuery === 'string' ? formQuery : '',
                        },
                    })
                }}
            >
                <Row>
                    <Col sm className="mt-2">
                        <Row>
                            <Col>
                                <FormControl
                                    as="select"
                                    value={provider}
                                    onChange={(event) => {
                                        handler({
                                            set: {
                                                provider: event.target.value,
                                            },
                                            delete: ['category', 'query'],
                                        })
                                    }}
                                >
                                    <option value="">-- select provider --</option>
                                    {providerNames.map((v) => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                                </FormControl>
                            </Col>
                            <Col>
                                <FormControl
                                    as="select"
                                    value={category}
                                    onChange={(event) => {
                                        handler({
                                            set: {
                                                category: event.target.value,
                                            },
                                            delete: ['query'],
                                        })
                                    }}
                                    disabled={!provider}
                                >
                                    <option value="">All categories</option>
                                    {categories.map((v, vi) => (
                                        <Fragment key={vi}>
                                            {v.subcategories.length > 0 ? (
                                                <>
                                                    <optgroup label={v.name}>
                                                        <option value={v.id}>All {v.name}</option>
                                                        {v.subcategories.map((s, si) => (
                                                            <option value={s.id} key={si}>
                                                                {s.name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                </>
                                            ) : (
                                                <>
                                                    <option value={v.id}>{v.name}</option>
                                                </>
                                            )}
                                        </Fragment>
                                    ))}
                                </FormControl>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm className="mt-2">
                        <InputGroup>
                            <FormControl
                                disabled={!provider}
                                defaultValue={query}
                                type="search"
                                placeholder="Search..."
                                name="query"
                            />
                            <InputGroup.Append className="border-0">
                                <Button
                                    disabled={!provider}
                                    variant="outline-primary"
                                    type="submit"
                                    className="ti-search btn-simple m-0"
                                />
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
            {error && (
                <Alert variant="danger" className="mt-5">
                    {error}
                </Alert>
            )}
            {loading && (
                <div className="d-flex justify-content-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
            {!loading && torrents?.length === 0 && canSearch && (
                <Alert variant="info" className="mt-5">
                    No results were found
                </Alert>
            )}
            {!loading && (
                <Table className="mt-3">
                    <tbody>
                        {torrents?.map((torrent, ti) => (
                            <>
                                <tr key={ti}>
                                    <td className="text-break">
                                        {torrent.link ? (
                                            <a
                                                href={torrent.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {torrent.name}
                                            </a>
                                        ) : (
                                            torrent.name
                                        )}{' '}
                                        {torrent.category && <Badge
                                            variant="info"
                                            pill={true}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                torrent.category && handler({
                                                    set: {
                                                        category: torrent.category.id,
                                                    },
                                                })
                                            }}
                                        >
                                            {torrent.category.name}
                                        </Badge>}{' '}
                                        {torrent.isVip && <i className="ti-crown text-warning"></i>}
                                        {' '}
                                        {!!torrent.comments && <Badge className="text-secondary" variant="light">
                                            <i className="ti-comments"></i> {torrent.comments}
                                        </Badge>}
                                    </td>
                                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                        {torrent.size}
                                    </td>
                                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                        {!!torrent.time && formatDate(new Date(torrent.time))}
                                    </td>
                                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                        {torrent.seeds != null && (
                                            <span className="text-success">
                                                <small className="ti-arrow-up"></small>
                                                {torrent.seeds}
                                            </span>
                                        )}{' '}
                                        {torrent.peers != null && (
                                            <span className="text-danger">
                                                <small className="ti-arrow-down"></small>
                                                {torrent.peers}
                                            </span>
                                        )}{' '}
                                        {torrent.downloads != null && (
                                            <span>
                                                <small className="ti-download"></small>{' '}
                                                {torrent.downloads}
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        {torrent.magnet ? <Link
                                            to={`/play?torrent=${encodeURIComponent(
                                                torrent.magnet
                                            )}`}
                                            className="btn btn-success ti-control-play"
                                        ></Link> : <AsyncButton variant="success" className="ti-control-play" onClick={async () => {
                                            const { magnet } = await new BrowseApi(getApiConfig({ bearer })).getMagnet({
                                                provider,
                                                torrentId: torrent.id
                                            })
                                            history.push(`/play?torrent=${encodeURIComponent(magnet)}`)
                                        }}>

                                        </AsyncButton>}
                                    </td>
                                </tr>
                            </>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    )
})
