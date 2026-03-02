'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack, Typography, Box, Button, Card } from '@mui/material'

import { PropertyCard, PropertyCarousel } from '@shared/Property'

import { type ApiQueryParams, type Property } from 'services/API'
import SearchService from 'services/Search'
import { CarouselHeader } from '@shared/Property/Carousel/components'
import TeamSection from './TeamSection'
import { StatsWidgets } from '@shared/Stats'
import { useFeatures } from 'providers/FeaturesProvider'
import defaultLocation from '@configs/location'


const FeaturedProperties = () => {
  const [featured, setFeatured] = useState<Property[]>([])
  const [recentlySold, setRecentlySold] = useState<Property[]>([])
  const [showcased, setShowcased] = useState<Property[]>([])
  const t = useTranslations('HomePage')
  const features = useFeatures()

  const filters: Partial<ApiQueryParams> = {
    class: 'condo',
    minPrice: 1_000_000,
    resultsPerPage: 12
  }

  const soldFilters: Partial<ApiQueryParams> = {
    ...filters,
    status: 'A',
    sortBy: 'soldDateDesc'
  }

  const filterShowcased: Partial<ApiQueryParams> = {
    class: 'condo',
    minPrice: 1_000_000,
    resultsPerPage: 12
  }

  const fetchShowcased = async () => {
    try {
      const response = await SearchService.fetchListings(filterShowcased)
      if (response) setShowcased(response.listings)
    } catch (error) {
      console.error('Featured::Error fetching data', error)
    }
  }

  const fetchFeatured = async () => {
    try {
      const response = await SearchService.fetchListings(filters)
      if (response) setFeatured(response.listings)
    } catch (error) {
      console.error('Featured::Error fetching data', error)
    }
  }

  const fetchRecentlySold = async () => {
    try {
      const response = await SearchService.fetchListings(soldFilters)
      if (response) setRecentlySold(response.listings)
    } catch (error) {
      console.error('RecentlySold::Error fetching data', error)
    }
  }

  useEffect(() => {
    fetchFeatured()
    fetchRecentlySold()
    fetchShowcased()
  }, [])
  const { state, defaultFilters } = defaultLocation

  return (
    <Container maxWidth="lg">
      <Stack spacing={6} py={8}>
        <PropertyCarousel title={t('justListed')} properties={featured} />
        <PropertyCarousel title={t('recentlySold')} properties={recentlySold} />

        {features.dashboard && <StatsWidgets {...defaultFilters} name={state} />}


        <Box
          sx={{
            py: { xs: 3, sm: 4, md: 6 },
            px: { xs: 2, sm: 3, md: 4 },
            backgroundColor: '#f4f4f4',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#555',
              textAlign: 'center',
              maxWidth: '1200px',
              margin: '0 auto 40px',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            Featured In
          </Typography>
          <Box
            component="img"
            src="pc-partners.png"
            alt="Featured In"
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '600px', md: '800px' },
              height: 'auto',
              display: 'block'
            }}
          />
        </Box>
        {/*
       <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              width: { xs: '100%', md: '100%' },
              p: 3,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #cdcdcd',
              bgcolor: 'white'
            }}
          >
            <Typography variant="h3" fontWeight={600} mb={1}>
              Get insider access
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Want full access to current & past listings, data and tools to
              help you search smart?
            </Typography>
            <Button variant="contained" size="large">
              Join Now
            </Button>
          </Card>
        </Box>
*/}
        {/* <PropertyCarousel
          title={'Featured Listings in Toronto'}
          properties={featured}
        /> */}
        <Box>
          <CarouselHeader title={'Popular Preconstructions'} navigation={false} onPrev={function (): void {
            throw new Error('Function not implemented.')
          } } onNext={function (): void {
            throw new Error('Function not implemented.')
          } } />
          <br />
          {featured?.length > 0 ? (
            <Stack
              spacing={{ xs: 3, sm: 4, md: 4 }}
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              sx={{
                '& > *': {
                  width: { xs: '100% !important', sm: 'calc(48% - 8px) !important', md: 'calc(32% - 11px) !important' , lg: 'calc(24% - 12px) !important' },
                  height: '100% !important'
                }
              }}
            >
              {featured.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary"></Typography>
          )}
        </Box>
      </Stack>
    </Container>
  )
}

export default FeaturedProperties
