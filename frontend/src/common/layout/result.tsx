import React from 'react'
import { UseAsyncReturn } from 'react-async-hook'

import { ErrorMessage, Loader } from 'common/elements'

export function ResultContainer<T, Args extends any[] = any[]>({
    result,
    children,
}: {
    result: UseAsyncReturn<T, Args>
    children: (result: T) => React.ReactNode
}) {
    return (
        <>
            {result.error ? (
                <ErrorMessage error={result.error} retry={result.execute} />
            ) : undefined}
            {result.loading && !result.result && <Loader />}
            {result.result && children(result.result)}
        </>
    )
}
