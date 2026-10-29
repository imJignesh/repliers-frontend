import routes from '@configs/routes'

import { getLocationCrumbs } from './locationCrumbs'
import {
  getBreadcrumbJsonLd,
  getPropertyBreadcrumbItems
} from './structuredData'

describe('property breadcrumb structured data', () => {
  it('uses the curated location chain from the API, not search URLs', () => {
    const crumbs = getLocationCrumbs({
      items: [
        { name: 'Toronto', path: '/locations/toronto' },
        { name: 'Downtown', path: '/locations/toronto/downtown' },
        {
          name: 'Church-Yonge Corridor',
          path: '/locations/toronto/downtown/church-yonge-corridor'
        }
      ]
    })

    const items = getPropertyBreadcrumbItems(crumbs, 'https://precondo.ca', {
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

  it('skips location levels the API could not resolve', () => {
    const items = getPropertyBreadcrumbItems([], 'https://precondo.ca', {
      name: 'Expressions',
      url: 'https://precondo.ca/r/building/55-tom-brown-1021-rest-acres-brant'
    })
    expect(items.map(({ name }) => name)).toEqual(['For sale', 'Expressions'])
  })
})

import { type ApiQueryResponse, type Property } from 'services/API'

import {
  getBuildingJsonLd,
  getBuildingUnitTotal,
  getListingJsonLd
} from './structuredData'

const unit = (overrides: Partial<Property> = {}): Property =>
  ({
    mlsNumber: 'C13734516',
    boardId: 2,
    status: 'A',
    lastStatus: 'New',
    type: 'Sale',
    listPrice: '649000',
    images: ['IMG-C13734516_1.jpg'],
    address: {
      area: 'Toronto',
      city: 'Downtown',
      neighborhood: 'Niagara',
      unitNumber: '1610',
      streetNumber: '100',
      streetName: 'Western Battery',
      streetSuffix: 'Rd',
      zip: 'M6K 3S2',
      state: 'Ontario',
      country: 'Canada'
    },
    details: {
      description: 'Bright two bedroom suite.',
      propertyType: 'Condo Apt',
      numBedrooms: '2',
      numBathrooms: '1',
      sqft: '700'
    },
    map: { latitude: 43.639949, longitude: -79.4158187 },
    ...overrides
  }) as unknown as Property

const buildingResponse = (
  building: Record<string, unknown> | null,
  listings: Property[]
): ApiQueryResponse =>
  ({
    page: 1,
    numPages: 1,
    pageSize: 24,
    count: listings.length,
    statistics: { listPrice: { min: '649000', max: '899000' } },
    listings,
    building
  }) as unknown as ApiQueryResponse

describe('building unit totals (audit RT07)', () => {
  it('prefers the integer total_units column', () => {
    expect(getBuildingUnitTotal({ total_units: 314 })).toBe(314)
    expect(getBuildingUnitTotal({ total_units: '314' })).toBe(314)
  })
  it('falls back to the Building Scale summary shown on the page', () => {
    expect(
      getBuildingUnitTotal({ floors_units: 'Floors: 24 | Total Units: 314' })
    ).toBe(314)
    expect(
      getBuildingUnitTotal({
        total_units: 0,
        floors_units: 'Total units: 1,204'
      })
    ).toBe(1204)
  })
  it('returns null rather than guessing when no total is recorded', () => {
    expect(getBuildingUnitTotal(null)).toBeNull()
    expect(getBuildingUnitTotal({})).toBeNull()
    expect(getBuildingUnitTotal({ floors_units: 'Floors: 24' })).toBeNull()
    expect(
      getBuildingUnitTotal({ floors_units: 'Total Units: N/A' })
    ).toBeNull()
  })
})

describe('building structured data (audit RT07)', () => {
  const listings = [
    unit(),
    unit({
      mlsNumber: 'C2',
      listPrice: '899000',
      address: { ...unit().address, unitNumber: '2201' }
    } as any),
    unit({
      mlsNumber: 'C3',
      status: 'U',
      lastStatus: 'Sld',
      soldPrice: '700000'
    } as any)
  ]
  const response = buildingResponse(
    {
      name: 'Vibe at Liberty Village',
      floors_units: 'Floors: 24 | Total Units: 314',
      location: {
        area: { name: 'Toronto' },
        city: { name: 'Downtown' },
        locality: { name: 'Niagara' }
      }
    },
    listings
  )
  const data = getBuildingJsonLd(
    response,
    'https://precondo.ca',
    'Vibe at Liberty Village',
    '100-western-battery'
  ) as any

  it('reports the verified building total, not the number of active listings', () => {
    expect(data.about['@type']).toBe('ApartmentComplex')
    expect(data.about.numberOfAccommodationUnits).toEqual({
      '@type': 'QuantitativeValue',
      value: 314
    })
    expect(data.about.numberOfAvailableAccommodationUnits).toEqual({
      '@type': 'QuantitativeValue',
      value: 3
    })
    expect(data.offers.offerCount).toBe(3)
  })

  it('omits the total when the building record has none', () => {
    const noTotal = getBuildingJsonLd(
      buildingResponse({ name: 'X' }, listings),
      'https://precondo.ca',
      'X',
      'x'
    ) as any
    expect(noTotal.about.numberOfAccommodationUnits).toBeUndefined()
  })

  it('keeps unit facts off the complex and addresses the complex without a unit number', () => {
    expect(data.about.address.streetAddress).toBe('100 Western Battery Rd')
    expect(data.about.numberOfBedroomsTotal).toBeUndefined()
    expect(data.about.numberOfBedrooms).toBeUndefined()
    expect(data.about.numberOfBathroomsTotal).toBeUndefined()
    expect(data.about.floorSize).toBeUndefined()
    expect(JSON.stringify(data)).not.toContain('numberOfBedroomsTotal')
  })

  it('links active unit offers to the complex by stable identifiers', () => {
    const buildingId = `https://precondo.ca${routes.building}/100-western-battery#building`
    expect(data.about['@id']).toBe(buildingId)
    expect(data.offers['@type']).toBe('AggregateOffer')
    expect(data.offers.lowPrice).toBe(649000)
    expect(data.offers.highPrice).toBe(899000)
    // the sold unit is not an offer
    expect(data.offers.offers).toHaveLength(2)
    const [first] = data.offers.offers
    expect(first['@type']).toBe('Offer')
    expect(first.price).toBe(649000)
    expect(first.itemOffered['@type']).toBe('Apartment')
    expect(first.itemOffered['@id']).toBe(`${first.url}#unit`)
    expect(first.itemOffered.containedInPlace).toEqual({ '@id': buildingId })
    expect(first.itemOffered.address.streetAddress).toBe(
      '#1610 - 100 Western Battery Rd'
    )
    expect(first.itemOffered.numberOfBedrooms).toBe(2)
    expect(first.itemOffered.numberOfBathroomsTotal).toBe(1)
    expect(first.itemOffered.floorSize.value).toBe(700)
  })
})

describe('listing structured data vocabulary (audit RT07)', () => {
  it('uses numberOfBedrooms instead of the undefined numberOfBedroomsTotal', () => {
    const data = getListingJsonLd(unit(), 'https://precondo.ca') as any
    expect(data.about['@type']).toBe('Apartment')
    expect(data.about.numberOfBedrooms).toBe(2)
    expect(data.about.numberOfBedroomsTotal).toBeUndefined()
    expect(data.offers.price).toBe(649000)
  })
})
