'use client'

import { useEffect, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Stack,
  IconButton,
  Collapse
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import { useFeatures } from 'providers/FeaturesProvider'
import {
  Autosuggestion,
  AutosuggestionContainer,
  Logo,
  MobileMenu,
  ToolbarMenu
} from './components'

import APILocations, { type Area } from 'services/API/APILocations'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import { useRouter } from 'next/navigation'

const Header = () => {
  const features = useFeatures()
  const router = useRouter()
  const [areas, setAreas] = useState<Area[]>([])
  const [openSearch, setOpenSearch] = useState(false)
  const [mobileNeighbourhoodsOpen, setMobileNeighbourhoodsOpen] = useState(false)

  useEffect(() => {
    APILocations.fetchAreas().then((data) => {
      if (data && Array.isArray(data)) {
        setAreas(data.sort((a, b) => a.name.localeCompare(b.name)))
      }
    })
  }, [])

  return (
    <>
      {/* Header AppBar */}
      <Box sx={{ height: { xs: openSearch ? 160 : 64, sm: 72 } }}>
        <AppBar
          sx={{
            zIndex: 'modal',
            position: 'fixed',
            bgcolor: 'background.paper',
            color: 'text.primary'
          }}
        >
          <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 } }}>
            <Stack
              spacing={2}
              width="100%"
              height={48}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Logo />

              {/* Desktop Search */}
              {features.search && (
                <Box sx={{ display: { xs: 'none', md: 'block' }, flex: 1 }}>
                  <AutosuggestionContainer>
                    <Autosuggestion />
                  </AutosuggestionContainer>
                </Box>
              )}

              <Stack direction="row" alignItems="center" spacing={1}>
                {/* Mobile Search Toggle Icon */}
                {features.search && (
                  <IconButton
                    onClick={() => setOpenSearch(!openSearch)}
                    sx={{ display: { xs: 'flex', md: 'none' } }}
                  >
                    {openSearch ? <CloseIcon /> : <SearchIcon />}
                  </IconButton>
                )}

                {/* Toolbar menu */}
                <ToolbarMenu sx={{ display: { xs: 'none', md: 'flex' } }} />

                {/* Desktop Neighbourhoods Button only */}
                <PopupState variant="popover" popupId="desktop-neighbourhoods">
                  {(popupState) => (
                    <>
                      <Button
                        variant="outlined"
                        {...bindTrigger(popupState)}
                        sx={{
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                          display: { xs: 'none', md: 'inline-flex' },
                          justifyContent: 'center',
                        }}
                      >
                        Neighbourhoods
                      </Button>
                      <Menu {...bindMenu(popupState)}>
                        {areas.map((area) => (
                          <MenuItem
                            key={area.name}
                            onClick={() => {
                              popupState.close()
                              const path = `/locations/${area.name
                                .toLowerCase()
                                .replaceAll(' ', '-')}`
                              router.push(path)
                            }}
                          >
                            {area.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
                </PopupState>

                {/* Mobile menu icon */}
                <Box sx={{ textAlign: 'right', display: { xs: 'block', md: 'none' } }}>
                  <MobileMenu />
                </Box>
              </Stack>
            </Stack>

            {/* Mobile Search Input */}
            {features.search && (
              <Collapse in={openSearch} sx={{ display: { md: 'none' } }}>
                <Box sx={{ pt: 1, pb: 1 }}>
                  <AutosuggestionContainer>
                    <Autosuggestion />
                  </AutosuggestionContainer>
                </Box>
              </Collapse>
            )}
          </Container>
        </AppBar>
      </Box>

    </>
  )
}

export default Header