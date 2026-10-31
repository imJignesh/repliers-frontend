import React from 'react'
import dynamic from 'next/dynamic'
import { Box, Skeleton } from '@mui/material'

// recharts (~109 KB gzip) is loaded with the widgets instead of the page bundle
// (audit RT08).
const StatsWidgets = dynamic(
  () => import('@shared/Stats/StatsWidgets').then((m) => m.StatsWidgets),
  { loading: () => <Skeleton variant="rounded" height={320} /> }
)

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
