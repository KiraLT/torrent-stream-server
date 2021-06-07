import React, { Fragment } from 'react'
import { Link, useHistory } from 'react-router-dom'
import {
    Row,
    Col,
    FormControl,
    Alert,
    Button,
    InputGroup,
    Form,
    Badge,
    Container,
    Card,
    ListGroup,
} from 'react-bootstrap'
import { useAsync } from 'react-async-hook'
import { sortBy } from 'common-stuff'

import { BrowseApi, ProviderTorrentModel } from '../helpers/client'
import { useSearchParam, useSearchParamsHandler } from '../helpers/hooks'
import { formatDate, handleApiError } from '../helpers'
import { withBearer } from './parts/auth'
import { ErrorComponent, LoaderComponent } from './parts'
import { getApiConfig } from '../config'
import { AsyncButton } from './parts/button'

export const BrowseComponent = withBearer(({ bearer }) => {
    const handler = useSearchParamsHandler()
    const provider = useSearchParam('provider') ?? ''
    const category = useSearchParam('category') ?? undefined
    const query = useSearchParam('query') ?? ''

    const providers = useAsync(async () => {
        return new BrowseApi(getApiConfig({ bearer })).getProviders().catch(handleApiError)
    }, [bearer])

    const torrents = useAsync(async () => {
        if (!provider || !query) {
            return
        }

        return new BrowseApi(getApiConfig({ bearer }))
            .searchTorrents({
                provider,
                query,
                category,
            })
            .catch(handleApiError)
    }, [provider, query, category, bearer])

    const categories = provider
        ? providers.result?.find((v) => v.name === provider)?.categories ?? []
        : []

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
                                    disabled={providers.loading || torrents.loading}
                                >
                                    <option value="">-- select provider --</option>
                                    {sortBy(providers.result ?? [], (v) => v.name).map((v) => (
                                        <option key={v.name} value={v.name}>
                                            {v.name}
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
                                    disabled={!provider || torrents.loading}
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
                                disabled={!provider || torrents.loading}
                                defaultValue={query}
                                type="search"
                                placeholder="Search..."
                                name="query"
                            />
                            <InputGroup.Append className="border-0">
                                <Button
                                    disabled={!provider || torrents.loading}
                                    variant="outline-primary"
                                    type="submit"
                                    className="ti-search btn-simple m-0"
                                />
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
            {torrents.error && <ErrorComponent error={torrents.error} retry={torrents.execute} />}
            {providers.error && (
                <ErrorComponent error={providers.error} retry={providers.execute} />
            )}
            {torrents.loading && <LoaderComponent />}

            {torrents.result?.length === 0 && (
                <Alert variant="info" className="mt-5">
                    No results were found
                </Alert>
            )}
            {torrents.result && (
                <SearchResultsComponent
                    bearer={bearer}
                    provider={provider}
                    torrents={torrents.result}
                />
            )}
        </Container>
    )
})

function SearchResultsComponent({
    torrents,
    provider,
    bearer,
}: {
    bearer?: string
    provider: string
    torrents: ProviderTorrentModel[]
}): JSX.Element {
    const history = useHistory()
    const handler = useSearchParamsHandler()

    return (
        <>
            {!!torrents.length && (
                <>
                    <Card>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {torrents.map((torrent, ti) => (
                                    <ListGroup.Item key={ti} className="bg-transparent border-dark">
                                        <Row>
                                            <Col xs className="d-flex mb-2">
                                                <span className="justify-content-center align-self-center text-break">
                                                    {torrent.link ? (
                                                        <a
                                                            href={torrent.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-break"
                                                        >
                                                            {torrent.name}
                                                        </a>
                                                    ) : (
                                                        torrent.name
                                                    )}{' '}
                                                    {torrent.category && (
                                                        <Badge
                                                            variant="info"
                                                            pill={true}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                torrent.category &&
                                                                    handler({
                                                                        set: {
                                                                            category:
                                                                                torrent.category.id,
                                                                        },
                                                                    })
                                                            }}
                                                        >
                                                            {torrent.category.name}
                                                        </Badge>
                                                    )}{' '}
                                                    {torrent.isVip && (
                                                        <i className="ti-crown text-warning"></i>
                                                    )}{' '}
                                                    {!!torrent.comments && (
                                                        <Badge
                                                            className="text-secondary"
                                                            variant="light"
                                                        >
                                                            <i className="ti-comments"></i>{' '}
                                                            {torrent.comments}
                                                        </Badge>
                                                    )}
                                                </span>
                                            </Col>
                                            <Col lg={5} className="d-flex mb-2">
                                                <Row className="justify-content-center align-self-center w-100 m-0">
                                                    <Col className="d-flex pr-2 pl-2">
                                                        <span className="justify-content-center align-self-center">
                                                            {torrent.size}
                                                        </span>
                                                    </Col>
                                                    <Col className="d-flex pr-1 pl-2">
                                                        <span className="justify-content-center align-self-center">
                                                            {!!torrent.time &&
                                                                formatDate(new Date(torrent.time))}
                                                        </span>
                                                    </Col>
                                                    <Col className="d-flex pr-2 pl-2">
                                                        <span className="justify-content-center align-self-center">
                                                            {torrent.seeds != null && (
                                                                <span className="text-success text-nowrap">
                                                                    <small className="ti-arrow-up"></small>
                                                                    {torrent.seeds}
                                                                </span>
                                                            )}{' '}
                                                            {torrent.peers != null && (
                                                                <span className="text-danger text-nowrap">
                                                                    <small className="ti-arrow-down"></small>
                                                                    {torrent.peers}
                                                                </span>
                                                            )}{' '}
                                                            {torrent.downloads != null && (
                                                                <span className="text-nowrap text-info">
                                                                    <small className="ti-download"></small>{' '}
                                                                    {torrent.downloads}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </Col>
                                                    <Col className="d-flex pr-2 pl-2" xs="auto">
                                                        <span className="justify-content-center align-self-center ml-auto">
                                                            {torrent.magnet ? (
                                                                <Button
                                                                    as={Link}
                                                                    to={`/play?torrent=${encodeURIComponent(
                                                                        torrent.magnet
                                                                    )}`}
                                                                    variant="success"
                                                                    className="ti-control-play pr-4 pl-4"
                                                                ></Button>
                                                            ) : (
                                                                <AsyncButton
                                                                    variant="success"
                                                                    className="pr-4 pl-4"
                                                                    onClick={async () => {
                                                                        const { magnet } =
                                                                            await new BrowseApi(
                                                                                getApiConfig({
                                                                                    bearer,
                                                                                })
                                                                            ).getMagnet({
                                                                                provider,
                                                                                torrentId:
                                                                                    torrent.id,
                                                                            })
                                                                        history.push(
                                                                            `/play?torrent=${encodeURIComponent(
                                                                                magnet
                                                                            )}`
                                                                        )
                                                                    }}
                                                                >
                                                                    <i className="ti-control-play"></i>
                                                                </AsyncButton>
                                                            )}
                                                        </span>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </>
            )}
        </>
    )
}
