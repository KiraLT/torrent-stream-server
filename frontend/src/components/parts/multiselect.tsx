import React from 'react'

import { Dropdown, Form } from 'react-bootstrap'

export interface MultiselectProps {
    options: string[]
    selected?: string[]
    label?: string
    disabled?: boolean
    onSelect?: (selected: string[]) => void
}

export function MultiSelect({ options, label, selected, onSelect, disabled }: MultiselectProps): JSX.Element {
    return (
        <>
            <Dropdown>
                <Dropdown.Toggle
                    disabled={disabled}
                    className="btn-simple"
                    style={{
                        margin: '0'
                    }}
                    variant='default'
                >
                    <span className="w-100 text-truncate">
                        {selected?.length ? selected.join(', ') : label ?? '-- select --'}
                    </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className='fsz-sm'>
                    <div
                        style={{
                            maxHeight: '250px',
                            overflowY: 'auto',
                        }}
                    >
                        {options.map((v, i) => (
                            <Dropdown.Item
                                key={v}
                            >
                               <Form.Check type="checkbox" label={v} onChange={() => {

                                }}/>
                            </Dropdown.Item>
                        ))}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </>
    )
}

