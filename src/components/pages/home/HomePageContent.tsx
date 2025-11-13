'use client'

import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import defaultLocation from '@configs/location'
import { StatsWidgets } from '@shared/Stats'

import { useFeatures } from 'providers/FeaturesProvider'

import { FeaturedProperties, HomePageBanner } from './components'
import { PopularSearches } from '@pages/catalog/components'

const HomePageContent = () => {
  const features = useFeatures()
  const t = useTranslations('HomePage')

  const { state, defaultFilters } = defaultLocation

  return (
    <Box bgcolor="background.default">
      <HomePageBanner title={t('welcome')} subtitle={t('welcomeDescription')} />
      <FeaturedProperties />
      <PopularSearches city={'Toronto'} />
      {features.dashboard && <StatsWidgets {...defaultFilters} name={state} />}
      <br />
    </Box>
  )
}

export default HomePageContent
