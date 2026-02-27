import React from 'react'
import { Box } from '@mui/material'
import { StatsWidgets } from '@shared/Stats'

const InsightsDetails = ({ insights }: { insights?: { city?: string; neighborhood?: string } }) => {
    if (!insights || (!insights.city && !insights.neighborhood)) return null

    return (
        <Box id="insights" sx={{ scrollMarginTop: '100px', width: '100%' }}>
            <StatsWidgets
                city={insights.city || ''}
                neighborhood={insights.neighborhood}
                name={insights.neighborhood || insights.city || ''}
            />
        </Box>
    )
}

export default InsightsDetails
