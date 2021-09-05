import React from 'react'
import { Container } from 'react-bootstrap'

import { HistoryWidget } from 'features/history'
import { InputWidget } from 'features/torrents'
import { withBearer } from 'common/hoc'

export default withBearer((): JSX.Element => {
    return (
        <Container className="mt-3">
            <InputWidget />
            <HistoryWidget />
        </Container>
    )
})
