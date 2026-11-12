import { buildingFilterQuery } from './buildingFilterQuery'

describe('buildingFilterQuery', () => {
  it('is empty when the visitor has not narrowed the search', () => {
    expect(
      buildingFilterQuery({
        listingStatus: 'active',
        listingType: 'condo',
        sortBy: 'createdOnDesc'
      } as any)
    ).toBe('')
    expect(buildingFilterQuery(undefined)).toBe('')
  })

  it('passes beds, price and sale type as listing-search parameters', () => {
    const q = new URLSearchParams(
      buildingFilterQuery({
        listingStatus: 'active',
        listingType: 'condo',
        minBeds: 3,
        maxPrice: 300000
      } as any)
    )
    expect(q.get('minBeds')).toBe('3')
    expect(q.get('maxPrice')).toBe('300000')
    expect(q.get('type')).toBe('sale')
    expect(q.has('lastStatus')).toBe(false) // not a building filter
  })

  it('turns date choices into dates and keeps year built', () => {
    const q = new URLSearchParams(
      buildingFilterQuery({
        listingStatus: 'active',
        daysOnMarket: 'lastWeek',
        minYearBuilt: 2010
      } as any)
    )
    expect(q.get('minListDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(q.get('minYearBuilt')).toBe('2010')
  })
})
