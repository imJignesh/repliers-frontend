import { cleanManagement, getBuildingScale, getBuildingSizeRange, getBuiltYear } from './buildingFacts'

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

describe('getBuildingScale (audit R03)', () => {
  it('holds back a scale with more floors than units', () => {
    expect(getBuildingScale('Floors: 122 | Total Units: 7')).toBeNull()
  })
  it('keeps plausible or partial scales', () => {
    expect(getBuildingScale('Floors: 24 | Total Units: 314')).toBe('Floors: 24 | Total Units: 314')
    expect(getBuildingScale('Floors: 7')).toBe('Floors: 7')
    expect(getBuildingScale('')).toBeNull()
  })
})

describe('empty building facts (audit 4 C03)', () => {
  it('hides a build year with no year', () => {
    expect(getBuiltYear('Built:')).toBeNull()
    expect(getBuiltYear('')).toBeNull()
    expect(getBuiltYear('Built: 2014')).toBe('Built: 2014')
  })

  it('hides a building scale with no numbers and drops empty halves', () => {
    expect(getBuildingScale('Floors: | Total Units:')).toBeNull()
    expect(getBuildingScale('Floors: 9 | Total Units:')).toBe('Floors: 9')
    expect(getBuildingScale('Floors: 9 | Total Units: 23')).toBe(
      'Floors: 9 | Total Units: 23'
    )
  })
})
