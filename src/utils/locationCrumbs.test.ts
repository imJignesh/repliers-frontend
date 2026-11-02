import routes from '@configs/routes'

import {
  getBuildingHref,
  getBuildingPageLocationCrumbs,
  getLocationCrumbs,
  getPropertyLocationCrumbs
} from './locationCrumbs'

const beaches = {
  items: [
    { name: 'Toronto', path: '/locations/toronto' },
    { name: 'East End', path: '/locations/toronto/east-end' },
    { name: 'The Beaches', path: '/locations/toronto/east-end/the-beaches' }
  ]
}

describe('location breadcrumbs (audit RT03)', () => {
  it('maps API location items to /r/locations URLs', () => {
    expect(getLocationCrumbs(beaches)).toEqual([
      { name: 'Toronto', url: `${routes.listings}/toronto` },
      { name: 'East End', url: `${routes.listings}/toronto/east-end` },
      {
        name: 'The Beaches',
        url: `${routes.listings}/toronto/east-end/the-beaches`
      }
    ])
  })

  it('never builds a URL from address text', () => {
    // The old builder turned these names into /toronto/toronto/the-beaches-east-end-toronto.
    const property = {
      address: {
        area: 'Toronto',
        city: 'Toronto',
        neighborhood: 'The Beaches, East End, Toronto'
      },
      location: {
        area: null,
        city: null,
        locality: null,
        items: [],
        path: null
      }
    }
    expect(getPropertyLocationCrumbs(property)).toEqual([])
    expect(getLocationCrumbs(undefined)).toEqual([])
    expect(
      getLocationCrumbs({
        items: [
          { name: 'Toronto', path: null },
          { name: 'X', path: '/search/x' }
        ]
      })
    ).toEqual([])
  })

  it('reads curated slugs from payloads that predate location.items', () => {
    const glebe = {
      area: { name: 'Ottawa', slug: 'ottawa' },
      city: { name: 'Ottawa City', slug: 'ottawa-city' },
      locality: { name: 'Glebe', slug: 'glebe' },
      path: '/locations/ottawa/ottawa-city/glebe'
    }
    expect(getLocationCrumbs(glebe).map((c) => c.url)).toEqual([
      `${routes.listings}/ottawa`,
      `${routes.listings}/ottawa/ottawa-city`,
      `${routes.listings}/ottawa/ottawa-city/glebe`
    ])
    // Names without slugs, or slugs that do not join to the path, are ignored.
    expect(
      getLocationCrumbs({
        area: { name: 'Toronto' },
        path: '/locations/toronto'
      })
    ).toEqual([])
    expect(
      getLocationCrumbs({ ...glebe, path: '/locations/ottawa/glebe' })
    ).toEqual([])
  })

  it("uses the building's chain when it reaches further than the listing's", () => {
    const property = {
      location: { items: [{ name: 'Toronto', path: '/locations/toronto' }] },
      building: { location: beaches }
    }
    expect(getPropertyLocationCrumbs(property).map((c) => c.name)).toEqual([
      'Toronto',
      'East End',
      'The Beaches'
    ])
  })

  it("prefers the building's own chain on building pages", () => {
    const property = {
      // The sample listing sits in a different locality (a data error).
      location: {
        items: [
          { name: 'Toronto', path: '/locations/toronto' },
          { name: 'West End', path: '/locations/toronto/west-end' },
          {
            name: 'Roncesvalles',
            path: '/locations/toronto/west-end/roncesvalles'
          }
        ]
      },
      building: { location: beaches }
    }
    expect(getBuildingPageLocationCrumbs(property).map((c) => c.name)).toEqual([
      'Toronto',
      'East End',
      'The Beaches'
    ])
    expect(
      getBuildingPageLocationCrumbs({
        location: beaches,
        building: { location: { items: [] } }
      })
    ).toHaveLength(3)
  })

  it('links a building only when the API says it is published', () => {
    expect(getBuildingHref({ slug: 'the-rideau', published: true })).toBe(
      `${routes.building}/the-rideau`
    )
    expect(
      getBuildingHref({ slug: '1035-bank-ottawa', published: false })
    ).toBeNull()
    expect(getBuildingHref({ slug: 'older-payload' })).toBe(
      `${routes.building}/older-payload`
    )
    expect(getBuildingHref({ slug: '' })).toBeNull()
    expect(getBuildingHref(null)).toBeNull()
  })
})
