'use client'

import { useEffect, useState } from 'react'

import { Box, Button, Stack, Typography } from '@mui/material'

import { BuildingCard } from '@shared/Property'

import type { FeaturedBuilding } from 'services/API/APIBuildings'
import { fetchFeaturedBuildings } from 'services/API/fetchFeaturedBuildings'

const PopularBuildings = () => {
  const [buildings, setBuildings] = useState<FeaturedBuilding[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    setStatus('loading')
    fetchFeaturedBuildings().then(
      (data) => {
        if (!current) return
        setBuildings(data)
        setStatus('ready')
      },
      () => {
        if (current) setStatus('error')
      }
    )
    return () => {
      current = false
    }
  }, [attempt])

  return (
    <Box component="section" aria-labelledby="popular-buildings-title">
      <Typography
        id="popular-buildings-title"
        variant="h3"
        component="h2"
        mb={3}
      >
        Popular Buildings
      </Typography>
      {status === 'loading' && (
        <Typography role="status">Loading popular buildings…</Typography>
      )}
      {status === 'error' && (
        <Box>
          <Typography role="status">
            Popular buildings couldn’t be loaded. Please try again.
          </Typography>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </Button>
        </Box>
      )}
      {status === 'ready' &&
        (buildings.length ? (
          <Stack
            spacing={{ xs: 3, sm: 4, md: 4 }}
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              '& > *': {
                width: {
                  xs: '100% !important',
                  sm: 'calc(48% - 8px) !important',
                  md: 'calc(32% - 11px) !important',
                  lg: 'calc(24% - 12px) !important'
                },
                height: '100% !important'
              }
            }}
          >
            {buildings.map((building) => (
              <BuildingCard
                key={building.slug}
                building={{ ...building, link: `/r/building/${building.slug}` }}
              />
            ))}
          </Stack>
        ) : (
          <Typography>No popular buildings are available right now.</Typography>
        ))}
    </Box>
  )
}

export default PopularBuildings
