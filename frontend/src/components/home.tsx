import React, { useState } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { getHistoryItems, removeHistoryItem } from '../helpers/history'
import { withBearer } from './parts/auth'

export const HomeComponent = withBearer(
    (): JSX.Element => {
        const [input, setInput] = useState('')
        const [historyItems, setHistoryItems] = useState(getHistoryItems())
        const history = useHistory()

        return (
            <div className="container">
                <h2 className="mt-5">Create video stream</h2>
                <div className="form-group">
                    <input
                        className="form-control"
                        name="link"
                        placeholder="Torrent file or magnet link"
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value)
                        }}
                    />
                </div>
                <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                        if (input.trim()) {
                            history.push(`/play?torrent=${encodeURIComponent(input)}`)
                        }
                    }}
                >
                    Load video
                </button>
                {historyItems.length > 0 && (
                    <>
                        <h2 className="mt-5">History</h2>
                        <table className="table">
                            <tbody>
                                {historyItems.map((item) => (
                                    <>
                                        <tr>
                                            <td className="text-break">{item.name}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <Link
                                                    to={`/play?torrent=${encodeURIComponent(
                                                        item.link
                                                    )}`}
                                                    className="btn btn-outline-primary ti-control-play"
                                                ></Link>
                                                <button
                                                    className="btn btn-outline-danger ti-close ml-1"
                                                    onClick={() => {
                                                        removeHistoryItem(item)
                                                        setHistoryItems(getHistoryItems())
                                                    }}
                                                ></button>
                                            </td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        )
    }
)
