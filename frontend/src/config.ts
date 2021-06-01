import { Configuration } from './helpers/client'

export const themes = ['default', 'light', 'dark'] as const
export type Theme = typeof themes[any]

export function getTheme(theme: Theme): Theme {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    return theme === 'default' ? (isDarkMode ? 'dark' : 'light') : theme
}

export const apiDomain = (() => {
    if (process.env.NODE_ENV === 'production') {
        return `${window.location.protocol}//${window.location.host}`
    }
    if (window.location.host.includes('gitpod')) {
        return `${window.location.protocol}//${[
            3000,
            ...window.location.host.split('-').slice(1),
        ].join('-')}`
    }
    return 'http://127.0.0.1:3000'
})()

export function getApiConfig(options?: { bearer?: string }): Configuration {
    const { bearer } = options || {}

    return new Configuration({
        basePath: apiDomain,
        accessToken: bearer,
    })
}

export interface State {
    bearerRequired?: boolean
    bearer?: string
    latestVersionAlert?: string
    theme: Theme
}

export const defaultState: State = {
    theme: 'default',
}

export const packageName = 'torrent-stream-server'
export const packageVersion = process.env.REACT_APP_VERSION || '1.0.0'
export const releasesPage = 'https://github.com/KiraLT/torrent-stream-server/releases'
