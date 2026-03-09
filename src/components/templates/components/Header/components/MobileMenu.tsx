'use client'

import { useEffect, useState } from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { Box, Drawer, IconButton, Stack, Button, Collapse, List, ListItemButton, ListItemText, Divider } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'

import ProfileMenuPill from './ProfileMenuPill'
import ToolbarMenu from './ToolbarMenu'
import APILocations, { type Area } from 'services/API/APILocations'
import { useRouter } from 'next/navigation'
import routes from '@configs/routes'

const MobileMenu = () => {
  const [open, setOpen] = useState(false)
  const { desktop } = useBreakpoints()
  const [areas, setAreas] = useState<Area[]>([])
  const [showAreas, setShowAreas] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (desktop) setOpen(false)
  }, [desktop])

  useEffect(() => {
    APILocations.fetchAreas().then((data) => {
      if (data && Array.isArray(data)) {
        setAreas(data.sort((a, b) => a.name.localeCompare(b.name)))
      }
    })
  }, [])

  return (
    <>
      <IconButton onClick={() => setOpen(!open)} color="inherit">
        <MenuIcon />
      </IconButton>
      <Drawer
        elevation={1}
        anchor="top"
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        disableScrollLock
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 'drawer',
          '& .MuiDrawer-paper': {
            borderRadius: 0,
            bgcolor: 'common.white'
          }
        }}
      >
        <Box sx={{ p: 2, mt: { xs: '64px', sm: '72px' } }}>
          <Stack spacing={2} alignItems="stretch">
            <ToolbarMenu />
            <ProfileMenuPill />

            {/* Neighbourhoods - mobile only, collapsible list placed under sign-in */}
            <Divider />
            <Button
              onClick={() => setShowAreas((s) => !s)}
              variant="outlined"
              sx={{ justifyContent: 'center' }}
            >
              Neighbourhoods
            </Button>
            <Collapse in={showAreas} timeout="auto" unmountOnExit>
              <List disablePadding>
                {areas.map((area) => (
                  <ListItemButton
                    key={area.name}
                    onClick={() => {
                      setOpen(false)
                      const path = `${routes.listings}/${area.name.toLowerCase().replaceAll(' ', '-')}`
                      router.push(path)
                    }}
                  >
                    <ListItemText primary={area.name} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}

export default MobileMenu
