import React, { useState } from 'react'

import { Box, Paper, Skeleton, Tab, Tabs } from '@mui/material'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import { RequestInfoForm, AppointmentForm } from './components'

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
      <Tabs value={value} variant="fullWidth" onChange={handleChange}>
        <Tab label={authenticated ? "Book a Viewing" : "REGISTER TO VIEW PHOTOS"} />
      </Tabs>
      <Box
        sx={{
          mt: '-1px',
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
