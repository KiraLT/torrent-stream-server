import React from 'react'
import { Link } from 'react-router-dom'
import { Switch, Route } from 'react-router'

import { HomeComponent } from './home'
import { PlayComponent } from './play'
import { BrowseComponent } from './browse'
import { DashboardComponent } from './dashboard'

export function ContentComponent(): JSX.Element {
    return <div>
            <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
            <h5 className="my-0 mr-md-auto font-weight-normal"><Link className='text-decoration-none text-dark' to='/'>Torrent Stream Server</Link></h5>
            <nav className="my-2 my-md-0 mr-md-3">
                <Link className="p-2 text-dark" to="/">Home</Link>
                <Link className="p-2 text-dark" to="/browse">Browse</Link>
                <Link className="p-2 text-dark" to="/dashboard">Dashboard</Link>
            </nav>
                <a className="btn btn-outline-primary" href="https://github.com/KiraLT/torrent-stream-server" target="_blank" rel="noopener noreferrer">Find on GitHub</a>
            </div>

            <Switch>
                <Route path="/" component={HomeComponent} exact />
                <Route path="/play" component={PlayComponent} exact />
                <Route path="/browse" component={BrowseComponent} exact />
                <Route path="/dashboard" component={DashboardComponent} exact />
            </Switch>
    </div>
}
