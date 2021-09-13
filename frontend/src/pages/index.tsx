import React from 'react'
import { Switch, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { Container } from 'react-bootstrap'

import HomePage from 'pages/home'
import PlayPage from 'pages/play'
import BrowsePage from 'pages/browse'
import DashboardPage from 'pages/dashboard'
import { TopNavigation } from 'common/layout'
import { VersionAlert } from 'features/version'

import 'react-toastify/dist/ReactToastify.css'

export function Pages(): JSX.Element {
    return (
        <>
            <div className="main-panel" {...{ data: 'blue' }}>
                <TopNavigation />

                <div className="content">
                    <Switch>
                        <Route path="/" component={HomePage} exact />
                        <Route path="/play" component={PlayPage} exact />
                        <Route path="/browse" component={BrowsePage} exact />
                        <Route
                            path="/dashboard"
                            component={DashboardPage}
                            exact
                        />
                    </Switch>
                </div>
                <footer className="footer">
                    <Container fluid>
                        <div className="copyright">
                            Find on{' '}
                            <a
                                href="https://github.com/KiraLT/torrent-stream-server"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {' '}
                                <i className="ti-github"></i> GitHub
                            </a>
                        </div>
                    </Container>
                </footer>
            </div>
            <ToastContainer limit={5} />
            <VersionAlert />
        </>
    )
}
