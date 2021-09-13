import React, { useEffect, useState } from 'react'

export function TextPlayerWidget({ url }: { url: string }): JSX.Element {
    const [value, setValue] = useState<string>()

    useEffect(() => {
        fetch(url).then(async (v) => setValue(await v.text()))
    })

    return (
        <div className="card card-body" style={{ maxHeight: '500px' }}>
            {value === undefined && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
            <pre>{value}</pre>
        </div>
    )
}
