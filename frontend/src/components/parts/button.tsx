import React, { useState, ReactNode } from 'react'
import { Button, Spinner, ButtonProps, Modal, Toast } from 'react-bootstrap'
import { parseError } from '../../helpers'

type AsyncButtonProps = {
    onClick: () => Promise<unknown>
    className?: string
    children?: ReactNode
    confirm?: {
        content?: ReactNode
        title?: ReactNode
        button?: {
            text?: string
            variant?: ButtonProps['variant']
        }
    }
} & ButtonProps

export function AsyncButton({
    onClick,
    active,
    disabled,
    variant,
    className,
    children,
    confirm,
}: AsyncButtonProps): JSX.Element {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        setLoading(true)
        setOpen(false)

        try {
            await onClick()
        } catch (error) {
            setError(await parseError(error))
            setTimeout(() => {
                setError('')
            }, 3000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Toast
                show={!!error}
                onClose={() => setError('')}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                }}
                className="bg-danger"
            >
                <Toast.Header className="text-danger">
                    <strong className="mr-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>{error}</Toast.Body>
            </Toast>
            <Button
                variant={variant}
                className={className}
                active={active}
                disabled={disabled || loading}
                onClick={async () => {
                    if (confirm) {
                        setOpen(true)
                    } else {
                        await handleConfirm()
                    }
                }}
            >
                {loading && <Spinner as="span" animation="border" size="sm" />} {children}
            </Button>
            {confirm && confirm.content && (
                <Modal
                    show={open}
                    onHide={() => {
                        setOpen(false)
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{confirm.title ?? 'Confirmation'}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>{confirm.content}</Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                setOpen(false)
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant={confirm.button?.variant ?? 'primary-outline'}
                            onClick={handleConfirm}
                        >
                            {confirm.button?.text ?? 'Confirm'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}
