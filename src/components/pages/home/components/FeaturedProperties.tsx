'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack, Typography, Box, Button, Card } from '@mui/material'

import { PropertyCard, PropertyCarousel, BuildingCard } from '@shared/Property'

import { type ApiQueryParams, type Property } from 'services/API'
import SearchService from 'services/Search'
import { CarouselHeader } from '@shared/Property/Carousel/components'
import TeamSection from './TeamSection'
import { StatsWidgets } from '@shared/Stats'
import { useFeatures } from 'providers/FeaturesProvider'
import defaultLocation from '@configs/location'


const FeaturedProperties = () => {
  const [featured, setFeatured] = useState<Property[]>([])
  const [featuredBuildings, setFeaturedBuildings] = useState<any[]>([])
  const [showcasedListings, setShowcasedListings] = useState<Property[]>([])
  const [showcased, setShowcased] = useState<Property[]>([])
  const [popularPreconstructions, setPopularPreconstructions] = useState<any[]>([])
  const t = useTranslations('HomePage')
  const features = useFeatures()

  const filters: Partial<ApiQueryParams> = {
    class: 'condo',
    propertyType: 'Condo Apt',
    city: 'Toronto',
    sortBy: 'createdOnDesc',
    resultsPerPage: 8
  }

  const showcasedFilters: Partial<ApiQueryParams> = {
    brokerage: 'IRISE',
    resultsPerPage: 8,
    status: 'A',
    sortBy: 'createdOnDesc'
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

  const fetchShowcasedListings = async () => {
    try {
      const response = await SearchService.fetchListings(showcasedFilters)
      if (response) setShowcasedListings(response.listings)
    } catch (error) {
      console.error('ShowcasedListings::Error fetching data', error)
    }
  }

  const fetchPreconstructions = async () => {
    try {
      const ids = '783878,802840,823055,703649,791013,810770,807678,814448,812442,683657'
      const response = await fetch(`https://precondo.ca/wp-json/wp/v2/lv_listing?include=${ids}&_embed`)
      const data = await response.json()
      if (Array.isArray(data)) {
        const mapped = data.slice(0, 8).map(post => {
          const terms = post._embedded?.['wp:term'] || []
          const location = terms.flat().find((t: any) => t.taxonomy === 'listing_location')?.name || ''

          return {
            id: post.id,
            name: post.title?.rendered,
            address: location,
            link: post.link,
            coverPhotoUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
            isExternal: true
          }
        })
        setPopularPreconstructions(mapped)
      }
    } catch (error) {
      console.error('Preconstructions::Error fetching data', error)
    }
  }

  const fetchFeaturedBuildings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PRECONDO_URL}/api/buildings?tag=featured`)
      const data = await response.json()
      if (data && data.data) {
        setFeaturedBuildings(data.data.slice(0, 8))
      }
    } catch (error) {
      console.error('FeaturedBuildings::Error fetching data', error)
    }
  }

  useEffect(() => {
    fetchFeatured()
    fetchShowcasedListings()
    fetchShowcased()
    fetchFeaturedBuildings()
    fetchPreconstructions()
  }, [])
  const { state, defaultFilters } = defaultLocation

  return (
    <Container maxWidth="lg">
      <Stack spacing={6} py={8}>
        <PropertyCarousel title={t('justListed')} properties={featured} />
        <PropertyCarousel title={t('recentlySold')} properties={showcasedListings} />

        {features.dashboard && <StatsWidgets {...defaultFilters} name={`Toronto`} />}



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
          title={'Recent Listings in Toronto'}
          properties={featured}
        /> */}
        <Box>
          <CarouselHeader title={'Popular Preconstructions'} navigation={false} onPrev={function (): void {
            throw new Error('Function not implemented.')
          }} onNext={function (): void {
            throw new Error('Function not implemented.')
          }} />
          <br />
          {popularPreconstructions?.length > 0 ? (
            <Stack
              spacing={{ xs: 3, sm: 4, md: 4 }}
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              sx={{
                '& > *': {
                  width: { xs: '100% !important', sm: 'calc(48% - 8px) !important', md: 'calc(32% - 11px) !important', lg: 'calc(24% - 12px) !important' },
                  height: '100% !important'
                }
              }}
            >
              {popularPreconstructions.map((building, index) => (
                <BuildingCard key={index} building={building} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary"></Typography>
          )}
        </Box>

        <Box>
          <CarouselHeader title={'Popular Buildings'} navigation={false} onPrev={function (): void {
            throw new Error('Function not implemented.')
          }} onNext={function (): void {
            throw new Error('Function not implemented.')
          }} />
          <br />
          {featuredBuildings?.length > 0 ? (
            <Stack
              spacing={{ xs: 3, sm: 4, md: 4 }}
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              sx={{
                '& > *': {
                  width: { xs: '100% !important', sm: 'calc(48% - 8px) !important', md: 'calc(32% - 11px) !important', lg: 'calc(24% - 12px) !important' },
                  height: '100% !important'
                }
              }}
            >
              {featuredBuildings.map((building, index) => (
                <BuildingCard key={index} building={building} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary"></Typography>
          )}
        </Box>

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
              maxWidth: { xs: '100%', sm: '600px', md: '600px' },
              height: 'auto',
              display: 'block'
            }}
          />
        </Box>
      </Stack>
    </Container>
  )
}

export default FeaturedProperties
