import { useEffect } from 'react'
import {
    useAsync as _useAsync,
    UseAsyncReturn,
    UseAsyncOptions,
} from 'react-async-hook'

export function useAsync<R = unknown, Args extends any[] = any[]>(
    asyncFunction: () => Promise<R>,
    params: Args,
    options?: UseAsyncOptions<R> & { refreshInterval?: number }
): UseAsyncReturn<R, Args> {
    const { refreshInterval, ...rest } = options ?? {}
    const result = _useAsync(asyncFunction, params, {
        setLoading: (s) => {
            // Prevent clearing previous state
            return s
        },
        ...rest,
    })

    useEffect(() => {
        if (refreshInterval) {
            const interval = setInterval(() => {
                result.execute(...([] as any))
            }, refreshInterval)

            return () => {
                clearInterval(interval)
            }
        }
    }, [result, refreshInterval])

    return result
}
