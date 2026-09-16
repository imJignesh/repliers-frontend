'use client'

import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import { FeaturedProperties, HomePageBanner } from './components'

const HomePageContent = () => {
  const t = useTranslations('HomePage')


  return (
    <Box bgcolor="background.default">
      <HomePageBanner title={t('welcome')} subtitle={t('welcomeDescription')} />
      <FeaturedProperties />



    </Box >
  )
}

export default HomePageContent
