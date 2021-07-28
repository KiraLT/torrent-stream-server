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
import { useGlobal } from 'reactn'
import Select from 'react-select'

import { BrowseApi, ProviderTorrentModel } from '../helpers/client'
import { useSearchParam, useSearchParamsHandler } from '../helpers/hooks'
import { formatDate, handleApiError } from '../helpers'
import { withBearer } from './parts/auth'
import { ErrorComponent, LoaderComponent } from './parts'
import { getApiConfig, getTheme } from '../config'
import { AsyncButton } from './parts/button'

export const BrowseComponent = withBearer(({ bearer }) => {
    const handler = useSearchParamsHandler()
    const providers = useSearchParam('provider', true)
    const category = useSearchParam('category') ?? undefined
    const query = useSearchParam('query') ?? ''
    const history = useHistory()

    const allProviders = useAsync(async () => {
        return new BrowseApi(getApiConfig({ bearer })).getProviders().catch(handleApiError)
    }, [bearer])

    const searchResults = useAsync(async () => {
        if (!query) {
            return
        }

        return new BrowseApi(getApiConfig({ bearer }))
            .searchTorrents({
                query,
                category,
                ...(providers.length ? {providers} : {})
            })
            .catch(handleApiError)
    }, [providers, query, category, bearer])

    const categories = providers.length === 1
        ? allProviders.result?.items?.find((v) => providers.includes(v.provider))?.categories ?? []
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
                            <Col className="pl-1 pr-1">
                                <ProvidersSelect
                                    selected={providers}
                                    options={allProviders.result?.items?.map(v => v.provider) ?? []}
                                    loading={allProviders.loading}
                                    onChange={v => {
                                        handler({
                                            set: {
                                                provider: v.join(','),
                                            },
                                            delete: ['category'],
                                        })
                                    }}
                                />
                            </Col>
                            <Col className="pl-1 pr-1">
                                <FormControl
                                    as="select"
                                    value={category}
                                    onChange={(event) => {
                                        handler({
                                            set: {
                                                category: event.target.value,
                                            }
                                        })
                                    }}
                                    disabled={allProviders.loading || searchResults.loading}
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
                    <Col sm className="pl-1 pr-1 mt-2">
                        <InputGroup>
                            <FormControl
                                disabled={allProviders.loading || searchResults.loading}
                                defaultValue={query}
                                type="search"
                                placeholder="Search..."
                                name="query"
                            />
                            <InputGroup.Append className="border-0">
                                <Button
                                    disabled={allProviders.loading || searchResults.loading}
                                    variant="outline-primary"
                                    type="submit"
                                    className="ti-search btn-simple m-0"
                                />
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
            </Form>
            {searchResults.error && <ErrorComponent error={searchResults.error} retry={searchResults.execute} />}
            {allProviders.error && (
                <ErrorComponent error={allProviders.error} retry={allProviders.execute} />
            )}
            {searchResults.loading && <LoaderComponent />}

            {searchResults.result?.items?.length === 0 && (
                <Alert variant="info" className="mt-5">
                    No results were found
                </Alert>
            )}
            {searchResults.result && (
                <SearchResults
                    torrents={searchResults.result.items}
                    onCategorySelect={v => {
                        handler({
                            set: {
                                category: v,
                            },
                        })
                    }}
                    onProviderSelect={v => {
                        handler({
                            set: {
                                provider: v,
                            },
                        })
                    }}
                    onMagnetRequest={async v => {
                        const { magnet } =
                            await new BrowseApi(
                                getApiConfig({
                                    bearer,
                                })
                            ).getMagnet({
                                provider: v.provider,
                                torrentId:
                                    v.id,
                            })
                        history.push(
                            `/play?torrent=${encodeURIComponent(
                                magnet
                            )}`
                        )
                    }}
                />
            )}
        </Container>
    )
})

function ProvidersSelect({
    selected, options, loading, onChange
}: {
    selected: string[],
    options: string[]
    loading: boolean
    onChange: (values: string[]) => void
}) {
    const [theme] = useGlobal('theme')

    return <Select
        value={selected.length ? selected.map(v => ({
            label: v,
            value: v
        })) : {
            label: 'All providers',
            value: '*'
        }}
        options={[
            ...sortBy(options).map(v => ({
                label: v,
                value: v
            }))
        ]}
        isMulti
        isLoading={loading}
        onChange={(options) => {
            onChange(options.map(v => v.value).filter(v => v !== '*'))
        }}
        styles={{
            multiValue(base, state) {
                return {
                    ...base,
                    ...(state.data.value === '*' ? {
                        backgroundColor: 'grey'
                    } as const : {})
                }
            },
            multiValueLabel(base, state) {
                return {
                    ...base,
                    ...(state.data.value === '*' ? {
                        fontWeight: 'bold',
                        color: 'white',
                        paddingRight: 6
                    } as const : {})
                }
            },
            multiValueRemove(base, state) {
                return {
                    ...base,
                    ...(state.data.value === '*' ? {
                        display: 'none'
                    } as const : {})
                }
            }
        }}
        theme={(v) => ({
            ...v,
            colors: getTheme(theme) === 'dark' ? {
                ...v.colors,
                neutral0: '#1e1e25',
                primary25: '#27293d'
            } : {
                ...v.colors,
                primary: '#e14eca',
            }
        })}
    />
}

function SearchResults({
    torrents,
    onCategorySelect,
    onProviderSelect,
    onMagnetRequest
}: {
    torrents: ProviderTorrentModel[]
    onCategorySelect: (category: string) => void
    onProviderSelect: (provider: string) => void
    onMagnetRequest: (torrent: ProviderTorrentModel) => Promise<void>
}): JSX.Element {

    if (!torrents.length) {
        return <></>
    }

    return (
        <Card>
            <Card.Body>
                <ListGroup variant="flush">
                    {torrents.map((torrent, ti) => (
                        <ListGroup.Item key={ti} className="bg-transparent border-dark">
                            <Row>
                                <Col xs className="d-flex mb-2">
                                    <span className="justify-content-center align-self-center text-break">
                                        <SearchResultsTitle torrent={torrent} onCategorySelect={onCategorySelect} onProviderSelect={onProviderSelect}/>
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
                                                            await onMagnetRequest(torrent)
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
    )
}

function SearchResultsTitle({
    onCategorySelect, torrent, onProviderSelect
}: {
    torrent: ProviderTorrentModel
    onCategorySelect: (category: string) => void
    onProviderSelect: (provider: string) => void
}) {
    return <>
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
        <Badge
            variant="primary"
            pill={true}
            style={{ cursor: 'pointer' }}
            onClick={() => {
                onProviderSelect(torrent.provider)
            }}
        >
            {torrent.provider}
        </Badge>
        {torrent.category && (
            <Badge
                variant="info"
                pill={true}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    if (torrent.category) {
                        onCategorySelect(torrent.category.id)
                    }
                        
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
    </>
}