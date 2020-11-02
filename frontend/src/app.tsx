import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { setGlobal } from 'reactn'

import { defaultState } from './config'
import { ContentComponent } from './components/content'
import { register } from './serviceWorker'

export function initApp(target: HTMLElement | null): void {
    setupState()
    registerWebworker()

    ReactDOM.render(
        <BrowserRouter>
            <ContentComponent />
        </BrowserRouter>,
        target
    )
}

function setupState(): void {
    setGlobal(defaultState)
}

function registerWebworker(): void {
    register({
        onUpdate: () => {
            const div = document.createElement('div')
            div.style.position = 'fixed'
            div.style.bottom = '0'
            div.style.left = '0'
            div.style.right = '0'
            div.style.zIndex = '9999'
            div.style.textAlign = 'center'
            div.style.background = 'rgba(208, 208, 208, 0.90)'
            div.style.padding = '2px'
            div.className = 'text-secondary'
            div.innerHTML = `
                New content is available and will be used when all tabs for this page are closed
                <button class="btn btn-link" onClick="this.parentNode.style.display = 'none'">
                    x
                </button>`
            document.body.appendChild(div)
        },
    })
}
