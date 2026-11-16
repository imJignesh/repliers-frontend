import { type Metadata } from 'next'

import { type ToolbarConfig } from '@templates/Header/components/ToolbarMenu'

const content = {
  siteUrl: 'https://precondo.ca',
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
  // Centre crop (600x798) of siteSplashscreen for phones: the banner is a
  // tall portrait box there, so phones only ever see this middle strip.
  // 60 KB instead of 160 KB, same pixels on screen.
  siteSplashscreenMobile:
    'https://precondo.ca/r/precondo_main_image_mobile.webp',
  loginSplashscreen: 'https://precondo.ca/r/precondo_main_image.webp',
  siteName: 'Precondo',
  siteDefaultBrokerageName: 'IRISE',
  siteKeywords: ['Precondo', 'Precondos for sale in Canada'],
  siteDescription:
    "Welcome to Precondo, your exclusive access to all the new and upcoming condos in Canada. Everything you'll need when it comes to properties for Sale & Preconstruction Properties!",
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
      template: '%s',
      default: 'Precondo | Search & Analyze All Condos in Canada' // fallback
    },
    // metadataBase: new URL('https://smartmls.com/'), // canonical URL
    generator: 'Precondo',
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
      "Welcome to Precondo, your exclusive access to all the new and upcoming condos in Canada. Everything you'll need when it comes to properties for Sale & Preconstruction Properties!",
    icons: {
      icon: 'https://precondo.ca/r/favicon.ico'
    }
  } as Metadata,
  propertyMetadataTemplates: {
    listing: {
      title: '{{propertyType}} in {{neighborhood}}, {{city}} - {{address}} | Precondo',
      description: 'Check out {{propertyType}} at {{address}}, {{neighborhood}}, {{city}}.'
    },
    building: {
      title: '{{buildingName}} - {{address}}, {{city}} | Precondo',
      description:
        'Find condos for sale at {{buildingName}} located at {{address}}, {{city}}. Browse available units, past sale prices, and full building history on Precondo'
    },
    location: {
      title: '{{neighborhood}} Condos For Sale, {{city}} | Precondo',
      description:
        'Browse {{listingCount}} {{condoNoun}} for sale in {{neighborhood}}, {{city}}. See photos, floor plans, prices from ${{startingPrice}} & get listing alerts on Precondo.',
      // T03 (Nov full-site audit): no "Browse 0 condos … prices from $ &".
      descriptionNoPrice:
        'Browse {{listingCount}} {{condoNoun}} for sale in {{neighborhood}}, {{city}}. See photos, floor plans & get listing alerts on Precondo.',
      descriptionEmpty:
        'Explore condo buildings in {{neighborhood}}, {{city}} on Precondo. No condos are listed for sale here right now; get alerts when new listings appear.'
    }
  },
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
