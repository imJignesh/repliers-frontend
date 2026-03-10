import { type Metadata } from 'next'

import { type ToolbarConfig } from '@templates/Header/components/ToolbarMenu'

const content = {
  siteLogo: {
    url: 'https://precondo.ca/r/logo.svg',
    width: 36,
    height: 36
  },
  siteMobileLogo: {
    url: 'https://precondo.ca/r/logo.svg',
    width: 36,
    height: 36
  },
  siteFooterLogo: {
    url: 'https://precondo.ca/r/logo-footer.svg',
    width: 80,
    height: 100
  },
  siteSplashscreen: 'https://precondo.ca/r/precondo_main_image.webp',
  loginSplashscreen: 'https://precondo.ca/r/precondo_main_image.webp',
  siteName: 'Precondo',
  siteDefaultBrokerageName: 'DEFAULT BROKERAGE NAME',
  siteKeywords: ['Precondo', 'Precondos for sale in Canada'],
  siteDescription:
    "Welcome to Precondo, your exclusive access to all the new and upcoming condos in Canada. Everything you'll need when it comes to properties for Sale, Rent & Preconstruction Properties!",
  siteFooterDescription:
    'Our mission is to make the MLS more valuable while remaining committed to the needs of local markets. We do this by delivering exceptional customer service and striving for continuous innovation.',
  siteFullscreenFooter: '',
  homepageHeroBlock: {
    title: 'FIND CONDOS IN YOUR FAVORITE AREA',
    subTitle:
      'Precondo serves over XX,XXX real estate professionals in DEFAULTSTATE. As a top-rated multiple listing service (MLS), we provide property information and innovative products.'
  },

  siteMetadata: {
    title: {
      template: 'Precondo > %s',
      default: 'Precondo' // fallback
    },
    metadataBase: new URL('https://precondo.ca'),
    // alternates: {
    //   canonical: '/'
    // },
    generator: 'Next.js',
    applicationName: 'Precondo',
    referrer: 'origin-when-cross-origin',
    // keywords: ['DEFAULTKEY1', 'DEFAULTKEY2'],
    // authors: [{ name: 'John' }, { name: 'Jane' }],
    creator: 'Precondo',
    publisher: 'Precondo',
    // formatDetection: {
    //   email: false,
    //   address: false,
    //   telephone: false
    // },
    description:
      "Welcome to Precondo, your exclusive access to all the new and upcoming condos in Canada. Everything you'll need when it comes to properties for Sale, Rent & Preconstruction Properties!",
    icons: {
      icon: 'https://precondo.ca/r/favicon.ico'
    }
  } as Metadata,
  estimateMetadata: {
    title:
      'Precondo lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.',
    description:
      'Precondo lorem ipsum dolor sit amet, consectetur adipiscing elit DEFAULTSTATE.'
  } as Metadata,
  estimateResultMetadata: {
    title: '$ Property Valuation Report',
    description:
      'View your comprehensive $ home valuation from HomeIQ. AI-powered insights, neighbourhood trends, and market data for informed decisions.'
  } as Metadata,
  missingPropertyMetadata: {
    title: "Listing you are looking for isn't there.",
    description: "Listing you are looking for isn't there."
  } as Metadata,
  restrictedPropertyTitle:
    'This listing is only visible to registered users due to MLS compliance.',
  estimateBoardRegulations: '',
  toolbarMenuItems: [] as ToolbarConfig[]
}

export default content
