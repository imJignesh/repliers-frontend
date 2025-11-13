'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack, Typography, Box, Button, Card } from '@mui/material'

import { PropertyCard, PropertyCarousel } from '@shared/Property'

import { type ApiQueryParams, type Property } from 'services/API'
import SearchService from 'services/Search'
import { CarouselHeader } from '@shared/Property/Carousel/components'

const FeaturedProperties = () => {
  const [featured, setFeatured] = useState<Property[]>([])
  const [recentlySold, setRecentlySold] = useState<Property[]>([])
  const [showcased, setShowcased] = useState<Property[]>([])
  const t = useTranslations('HomePage')

  const filters: Partial<ApiQueryParams> = {
    class: 'condo',
    minPrice: 1_000_000,
    resultsPerPage: 12
  }

  const soldFilters: Partial<ApiQueryParams> = {
    ...filters,
    status: 'U',
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

  return (
    <Container maxWidth="lg">
      <Stack spacing={6} py={8}>
        <PropertyCarousel title={t('justListed')} properties={showcased} />
        <PropertyCarousel title={t('recentlySold')} properties={recentlySold} />

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

        {/* <PropertyCarousel
          title={'Featured Listings in Toronto'}
          properties={featured}
        /> */}
        <Box>
          <CarouselHeader title={'Featured Listings in Toronto'} />
          <br />
          {featured?.length > 0 ? (
            <Stack spacing={4} direction="row" flexWrap="wrap">
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
