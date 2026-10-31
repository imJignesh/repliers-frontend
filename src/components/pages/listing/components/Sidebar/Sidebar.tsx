import React, { useState } from 'react'

import { Box, Paper, Skeleton, Tab, Tabs, Typography } from '@mui/material'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import dynamic from 'next/dynamic'

// Direct import: the components barrel also exports the date-picker forms.
import RequestInfoForm from './components/RequestInfoForm'

// Shown to signed-in users only; carries the MUI date pickers (~79 KB gzip),
// so it is loaded on demand instead of with every listing page (audit RT08).
const AppointmentForm = dynamic(() => import('./components/AppointmentForm'), {
  loading: () => <Skeleton variant="rounded" height={320} />
})

const Sidebar = () => {
  const clientSide = useClientSide()
  const { authenticated } = useUser()
  const [value, setValue] = useState(0)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return clientSide ? (
    <Paper
      id="contact-section"
      sx={{
        border: 1,
        borderColor: 'divider',
        boxShadow: { xs: 0, md: 1 },
        scrollMarginTop: '100px'
      }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 3 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: -0.5 }}>
          {authenticated ? "Book a Viewing" : "Register to View All Photos"}
        </Typography>
        {!authenticated && (
           <Typography 
               variant="caption" 
               color="text.secondary" 
               sx={{ 
                   textAlign: 'center', 
                   display: 'block',
                   fontWeight: 500,
                   fontStyle: 'italic',
                   fontSize: '0.75rem',
                   lineHeight: 1.2
               }}
           >
               Toronto Real Estate Board Requires Registration for MLS Listings
           </Typography>
        )}
      </Box>
      <Box
        sx={{
          borderTop: 1,
          p: { xs: 3, md: 2 },
          borderColor: 'divider'
        }}
      >
        <Box>
          {authenticated ? <AppointmentForm /> : <RequestInfoForm />}
        </Box>
      </Box>
    </Paper>
  ) : (
    <Skeleton variant="rounded" height={740} sx={{ borderRadius: 2 }} />
  )
}

export default Sidebar
