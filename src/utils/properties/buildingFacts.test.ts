import { cleanManagement, getBuildingSizeRange } from './buildingFacts'

describe('building facts (audit RT02)', () => {
  it('does not present build years or scale as management', () => {
    for (const value of [
      'Built in 1991',
      'Built in -',
      'built in 2010',
      '53 floors/ 501 units',
      '9 floors / 23 units',
      '-',
      '',
      null,
      undefined
    ]) {
      expect(cleanManagement(value)).toBeNull()
    }
    expect(cleanManagement(' Del Property Management ')).toBe(
      'Del Property Management'
    )
  })

  it('reads the unit size range from size_range or the legacy field', () => {
    expect(getBuildingSizeRange({ size_range: '871 sqft - 1374 sqft' })).toBe(
      '871 sqft - 1374 sqft'
    )
    // Before the backend change: the range sits in price_sqft.
    expect(getBuildingSizeRange({ price_sqft: '545 sqft - 1570 sqft' })).toBe(
      '545 sqft - 1570 sqft'
    )
    expect(getBuildingSizeRange({ price_sqft: '5000 sqft' })).toBe('5000 sqft')
  })

  it('shows nothing for placeholders or prices', () => {
    expect(getBuildingSizeRange({ price_sqft: 'Sqft range -' })).toBeNull()
    expect(getBuildingSizeRange({ price_sqft: '$901 / sq. ft.' })).toBeNull()
    expect(
      getBuildingSizeRange({ size_range: null, price_sqft: '-' })
    ).toBeNull()
    expect(getBuildingSizeRange(null)).toBeNull()
  })
})
