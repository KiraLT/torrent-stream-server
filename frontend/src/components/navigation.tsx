import React, { useState } from 'react'
import { useGlobal } from 'reactn'
import { Link } from 'react-router-dom'
import { Collapse, Navbar, Container, Nav } from 'react-bootstrap'
import classnames from 'classnames'

import { getTheme } from '../config'

export function NavigationComponent(): JSX.Element {
    const [open, setOpen] = useState(false)
    const [theme, setTheme] = useGlobal('theme')

    return <>
        <Navbar expand="lg" variant={getTheme(theme) === 'dark' ? 'dark' : 'light'} className={classnames(
            'border-bottom', {
                'border-dark':  getTheme(theme) === 'dark',
                'border-light':  getTheme(theme) === 'light',
                'bg-white': window.innerWidth < 993 && open,
                'navbar-transparent': window.innerWidth >= 993 && !open
        })}>
            <Container fluid>
                <div className="navbar-wrapper">
                    <Navbar.Brand as={Link} to="/">
                        Torrent Stream Server
                        {' '}
                        <small className="text-muted">v{process.env.REACT_APP_VERSION}</small>
                    </Navbar.Brand>
                </div>
                <button className="navbar-toggler" id="navigation" type="button" onClick={() => setOpen(v => !v)}>
                    <span className="navbar-toggler-bar navbar-kebab" />
                    <span className="navbar-toggler-bar navbar-kebab" />
                    <span className="navbar-toggler-bar navbar-kebab" />
                </button>
                <Collapse in={open}>
                    <div className="navbar-collapse">
                        <Nav className="ml-auto" navbar>
                            <Nav.Link onClick={() => {
                                setTheme(getTheme(theme) === 'dark' ? 'light' : 'dark')
                            }}>
                                {getTheme(theme) === 'dark' ? <>
                                    <span className="color-label">LIGHT MODE</span>
                                    <span className="badge light-badge mr-2"></span>
                                </>: <>
                                    <span className="badge dark-badge ml-2"></span>
                                    <span className="color-label">DARK MODE</span>
                                </>}
                            </Nav.Link>
                            <Nav.Link as={Link} onClick={() => setOpen(false)} to="/" className="btn-link">Home</Nav.Link>
                            <Nav.Link as={Link} onClick={() => setOpen(false)} to="/browse" className="btn-link">Browse</Nav.Link>
                            <Nav.Link as={Link} onClick={() => setOpen(false)} to="/dashboard" className="btn-link">Dashboard</Nav.Link>
                        </Nav>
                    </div>
                </Collapse>
            </Container>
        </Navbar>
    </>
}
