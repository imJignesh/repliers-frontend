import { locationCount } from './locationCount'

describe('locationCount', () => {
  const edenbridge = { listing_count: 15, building_count: 6 }
  const alderwood = { listing_count: 0, building_count: 1 }

  it('shows listings in the Listings view and buildings in the Buildings view', () => {
    expect(locationCount(edenbridge, 'listings')).toBe(15)
    expect(locationCount(edenbridge, 'buildings')).toBe(6)
  })
  it('never shows a building count as a listing count', () => {
    expect(locationCount(alderwood, 'listings')).toBe(0)
    expect(locationCount(alderwood, 'buildings')).toBe(1)
  })
  it('treats missing or text counts safely', () => {
    expect(locationCount({ listing_count: '12' }, 'listings')).toBe(12)
    expect(locationCount({}, 'buildings')).toBe(0)
  })
})
