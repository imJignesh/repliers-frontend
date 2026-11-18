import routes from '@configs/routes'

import { getBuildingLinks, getLocationLinkGroups } from './locationLinks'

const tree = {
  name: 'Peel',
  slug: 'peel',
  children: [
    {
      name: 'Mississauga',
      slug: 'mississauga',
      listing_count: 649,
      children: [
        { name: 'Applewood', slug: 'applewood', listing_count: 39 },
        { name: 'City Centre', slug: 'city-centre', listing_count: 181 },
        { name: 'Clarkson', slug: 'clarkson', listing_count: 0 }
      ]
    },
    { name: 'Brampton', slug: 'brampton', children: [] }
  ]
}

describe('location links (audit 4 T09)', () => {
  it('links every city and neighbourhood from the area page', () => {
    const groups = getLocationLinkGroups(tree, ['peel'])
    expect(groups.map((g) => g.href)).toEqual([
      `${routes.listings}/peel/mississauga`,
      `${routes.listings}/peel/brampton`
    ])
    expect(groups[0].links.map((l) => l.href)).toEqual([
      `${routes.listings}/peel/mississauga/applewood`,
      `${routes.listings}/peel/mississauga/city-centre`,
      `${routes.listings}/peel/mississauga/clarkson`
    ])
  })

  it('links a city page to all its neighbourhoods, including empty ones', () => {
    const [group] = getLocationLinkGroups(tree, ['peel', 'mississauga'])
    expect(group.title).toBe('Neighbourhoods in Mississauga')
    expect(group.links).toHaveLength(3)
    expect(group.links[0]).toEqual({
      name: 'Applewood',
      href: `${routes.listings}/peel/mississauga/applewood`,
      count: 39
    })
  })

  it('links a neighbourhood page to its sibling neighbourhoods and city', () => {
    const [group] = getLocationLinkGroups(tree, ['peel', 'mississauga', 'applewood'])
    expect(group.href).toBe(`${routes.listings}/peel/mississauga`)
    expect(group.links.map((l) => l.name)).toEqual(['City Centre', 'Clarkson'])
  })

  it('returns nothing for an unknown or mismatched tree', () => {
    expect(getLocationLinkGroups(null, ['peel'])).toEqual([])
    expect(getLocationLinkGroups(tree, ['toronto'])).toEqual([])
    expect(getLocationLinkGroups(tree, ['peel', 'nowhere'])).toEqual([])
  })

  it('links buildings by slug and skips rows without one', () => {
    expect(
      getBuildingLinks([
        { name: '1055 Dundas Street Condos', slug: '1055-dundas', listing_count: 5 },
        { name: 'No slug', slug: '' }
      ])
    ).toEqual([
      { name: '1055 Dundas Street Condos', href: `${routes.building}/1055-dundas`, count: 5 }
    ])
  })
})
