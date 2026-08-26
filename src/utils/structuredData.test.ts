import routes from '@configs/routes'

import { type PropertyAddress } from 'services/API'

import {
  getBreadcrumbJsonLd,
  getPropertyBreadcrumbItems
} from './structuredData'

describe('property breadcrumb structured data', () => {
  it('uses cumulative canonical location URLs instead of search URLs', () => {
    const address = {
      area: 'Toronto',
      city: 'Downtown',
      neighborhood: 'Church-Yonge Corridor'
    } as PropertyAddress

    const items = getPropertyBreadcrumbItems(address, 'https://precondo.ca', {
      name: '199 Church Condos',
      url: 'https://precondo.ca/r/building/199-church-82-dalhousie'
    })

    const locations = `https://precondo.ca${routes.listings}`
    expect(items.map(({ url }) => url)).toEqual([
      locations,
      `${locations}/toronto`,
      `${locations}/toronto/downtown`,
      `${locations}/toronto/downtown/church-yonge-corridor`,
      'https://precondo.ca/r/building/199-church-82-dalhousie'
    ])

    expect(JSON.stringify(getBreadcrumbJsonLd(items))).not.toContain(
      '/r/search/'
    )
  })
})
