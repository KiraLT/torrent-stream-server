import React from 'react'
import { Switch, Route } from 'react-router'

import { HomeComponent } from './home'
import { PlayComponent } from './play'
import { BrowseComponent } from './browse'
import { DashboardComponent } from './dashboard'
import { NavigationComponent } from './navigation'

export function ContentComponent(): JSX.Element {
    return <>
        <div className="main-panel" {...{data: 'blue'}}>
            <NavigationComponent />

            <div className="content">
                <Switch>
                    <Route path="/" component={HomeComponent} exact />
                    <Route path="/play" component={PlayComponent} exact />
                    <Route path="/browse" component={BrowseComponent} exact />
                    <Route path="/dashboard" component={DashboardComponent} exact />
                </Switch>
            </div>
        </div>
    </>
}
