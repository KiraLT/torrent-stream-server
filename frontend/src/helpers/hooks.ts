import { useMemo, useContext } from 'react'
import { __RouterContext } from 'react-router'


export function useSearchParam<T extends string>(key: string): T | undefined
export function useSearchParam<T extends string>(key: string, multiValued?: false): T | undefined
export function useSearchParam<T extends string>(key: string, multiValued?: true): T[]
export function useSearchParam<T extends string>(key: string, multiValued: boolean = false): T | T[] | undefined {
    const { location } = useContext(__RouterContext)
    const params = useMemo(() => new URLSearchParams(location.search), [location.search])

    return useMemo(() => {
        return multiValued ? ((params.get(key) || '').split(',').filter(v => !!v) ?? []) as T[] : params.get(key) as T
    }, [params, multiValued, key])
}

export function useSearchParamsHandler() {
    const { location, history } = useContext(__RouterContext)

    return (
        args: { set?: Record<string, string>; delete?: readonly string[] },
        replace: boolean = false
    ) => {
        const params = new URLSearchParams(location.search)
        if (args.delete) {
            args.delete.forEach((v) => {
                params.delete(v)
            })
        }
        if (args.set) {
            Object.entries(args.set).forEach(([k, v]) => {
                if (v) {
                    params.set(k, v)
                } else {
                    params.delete(k)
                }
            })
        }
        if (replace) {
            history.replace({
                search: params.toString().replace(encodeURIComponent(':'), ':'),
            })
        } else {
            history.push({
                search: params.toString().replace(encodeURIComponent(':'), ':'),
            })
        }
    }
}
