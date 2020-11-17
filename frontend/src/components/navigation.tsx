import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ListGroup } from 'react-bootstrap'

export function NavigationComponent(): JSX.Element {
    const [open, setOpen] = useState(false)

    return <>
        <header className="d-md-none">
            <div className="navbar navbar-dark bg-dark shadow-sm">
                <div className="container d-flex justify-content-between">
                    <Link className="text-decoration-none text-light" to="/">
                        Torrent Stream Server
                        {' '}
                        <small className="text-muted">v{process.env.REACT_APP_VERSION}</small>
                    </Link>
                    <button className="navbar-toggler collapsed" type="button" onClick={() => setOpen(v => !v)}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
            </div>
            <div className={`bg-dark w-100 ${open ? '' : 'collapse'}`} style={{position: 'absolute', zIndex: 99999}}>
                <ListGroup variant="flush" className="bg-dark">
                    <ListGroup.Item as={Link} className="bg-dark text-light pl-4" to="/" onClick={() => setOpen(false)}>
                        Home
                    </ListGroup.Item>
                    <ListGroup.Item as={Link} className="bg-dark text-light pl-4" to="/browse" onClick={() => setOpen(false)}>
                        Browse
                    </ListGroup.Item>
                    <ListGroup.Item as={Link} className="bg-dark text-light pl-4" to="/dashboard" onClick={() => setOpen(false)}>
                        Dashboard
                    </ListGroup.Item>
                </ListGroup>
            </div>
        </header>
        <div className="d-none d-md-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
            <h5 className="my-0 mr-md-auto font-weight-normal">
                <Link className="text-decoration-none text-dark" to="/">
                    Torrent Stream Server
                    {' '}
                    <small className="text-muted">v{process.env.REACT_APP_VERSION}</small>
                </Link>
            </h5>
            <nav className="my-2 my-md-0 mr-md-3">
                <Link className="p-2 text-dark" to="/">
                    Home
                </Link>
                <Link className="p-2 text-dark" to="/browse">
                    Browse
                </Link>
                <Link className="p-2 text-dark" to="/dashboard">
                    Dashboard
                </Link>
            </nav>
            <a
                className="btn btn-outline-primary"
                href="https://github.com/KiraLT/torrent-stream-server"
                target="_blank"
                rel="noopener noreferrer"
            >
                Find on GitHub
            </a>
        </div>
    </>
}
