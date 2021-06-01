import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { setGlobal, addCallback } from 'reactn'

import { defaultState, getTheme, State, Theme } from './config'
import { ContentComponent } from './components/content'
import { unregister } from './serviceWorker'

import './assets/scss/black-dashboard-react.scss'
import './assets/demo/demo.css'
import './assets/custom.scss'

export async function initApp(target: HTMLElement | null): Promise<void> {
    const loadedState = loadState()

    await setGlobal(loadedState)
    updateTheme(loadedState.theme)

    addCallback((state) => {
        updateTheme(state.theme)
        saveState(state)
    })

    registerWebworker()

    ReactDOM.render(
        <BrowserRouter>
            <ContentComponent />
        </BrowserRouter>,
        target
    )
}

function loadState(): State {
    try {
        const value = localStorage.getItem('state')
        return value
            ? {
                  ...defaultState,
                  ...JSON.parse(value),
              }
            : defaultState
    } catch {
        return defaultState
    }
}

function saveState(state: State): void {
    localStorage.setItem(
        'state',
        JSON.stringify({
            theme: state.theme,
            latestVersionAlert: state.latestVersionAlert,
        })
    )
}

function registerWebworker(): void {
    unregister()
    // register({
    //     onUpdate: () => {
    //         const div = document.createElement('div')
    //         div.style.position = 'fixed'
    //         div.style.bottom = '0'
    //         div.style.left = '0'
    //         div.style.right = '0'
    //         div.style.zIndex = '9999'
    //         div.style.textAlign = 'center'
    //         div.style.background = 'rgba(208, 208, 208, 0.90)'
    //         div.style.padding = '2px'
    //         div.className = 'text-secondary'
    //         div.innerHTML = `
    //             New content is available and will be used when all tabs for this page are closed
    //             <button class='btn btn-link' onClick='this.parentNode.style.display = 'none''>
    //                 x
    //             </button>`
    //         document.body.appendChild(div)
    //     },
    // })
}

function updateTheme(theme: Theme): void {
    if (getTheme(theme) === 'dark') {
        document.documentElement.classList.remove('white-content')
    } else {
        document.documentElement.classList.add('white-content')
    }
}
