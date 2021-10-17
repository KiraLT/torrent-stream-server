import React from 'react'
import { Container } from 'react-bootstrap'

import { withBearer } from 'common/hoc'
import { UsageWidget, ActiveTorrentsWidget, LogsWidget } from 'features/dashboard'

export default withBearer(() => {
    return (
        <Container className="mt-3 content">
            <UsageWidget />
            <ActiveTorrentsWidget />
            <LogsWidget />
        </Container>
    )
})
