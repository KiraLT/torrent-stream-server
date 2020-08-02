import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

export function HomeComponent(): JSX.Element {
    const [input, setInput] = useState('')
    const history = useHistory()

    return <div className="container">
        <h2 className="mt-5">Create video stream</h2>
        <div className="form-group">
            <input className="form-control" name="link" placeholder="Torrent file or magnet link" value={input} onChange={event => {
                setInput(event.target.value)
            }}/>
        </div>
        <button className="btn btn-outline-primary" onClick={() => {
            if (input.trim()) {
                history.push(`/play?torrent=${encodeURIComponent(input)}`)
            }
        }}>Load video</button>
    </div>
}
