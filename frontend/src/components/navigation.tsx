import React, { useState } from 'react'
import { useGlobal } from 'reactn'
import { Link } from 'react-router-dom'
import { Collapse, Navbar, Container, Nav, FormCheck } from 'react-bootstrap'
import classnames from 'classnames'

import { getTheme, packageVersion } from '../config'

export function NavigationComponent(): JSX.Element {
    const [open, setOpen] = useState(false)
    const [theme, setTheme] = useGlobal('theme')

    return (
        <>
            <Navbar
                expand="lg"
                variant={getTheme(theme) === 'dark' ? 'dark' : 'light'}
                className={classnames({
                    'bg-white': getTheme(theme) === 'light' || (window.innerWidth < 993 && open),
                    'border-bottom border-dark': getTheme(theme) === 'dark',
                })}
            >
                <Container>
                    <div className="navbar-wrapper">
                        <Navbar.Brand as={Link} to="/">
                            Torrent Stream Server{' '}
                            <small className="text-muted">v{packageVersion}</small>
                        </Navbar.Brand>
                    </div>
                    <button
                        className="navbar-toggler"
                        id="navigation"
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                    >
                        <span className="navbar-toggler-bar navbar-kebab" />
                        <span className="navbar-toggler-bar navbar-kebab" />
                        <span className="navbar-toggler-bar navbar-kebab" />
                    </button>
                    <Collapse in={open}>
                        <div className="navbar-collapse">
                            <Nav className="ml-auto" navbar>
                                <Nav.Link
                                    as={FormCheck}
                                    type="switch"
                                    id="dark-theme"
                                    label="dark"
                                    className="mr-3"
                                    checked={getTheme(theme) === 'dark'}
                                    onChange={() => {
                                        setTheme(getTheme(theme) === 'dark' ? 'light' : 'dark')
                                    }}
                                />
                                <Nav.Link as={Link} onClick={() => setOpen(false)} to="/">
                                    Home
                                </Nav.Link>
                                <Nav.Link as={Link} onClick={() => setOpen(false)} to="/browse">
                                    Browse
                                </Nav.Link>
                                <Nav.Link as={Link} onClick={() => setOpen(false)} to="/dashboard">
                                    Dashboard
                                </Nav.Link>
                            </Nav>
                        </div>
                    </Collapse>
                </Container>
            </Navbar>
        </>
    )
}
