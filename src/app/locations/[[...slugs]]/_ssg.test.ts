import { jest } from '@jest/globals'

jest.unstable_mockModule('next/headers', () => ({ headers: async () => ({}) }))

const { withPageNumber } = await import('./_ssg')

// Technical audit TA04: pages 2+ get their own title.
describe('withPageNumber', () => {
  it('puts the page number before the site name', () => {
    expect(withPageNumber('Downtown Condos For Sale | Precondo', 2)).toBe(
      'Downtown Condos For Sale - Page 2 | Precondo'
    )
  })
  it('appends it when there is no site name', () => {
    expect(withPageNumber('Downtown Condos', 3)).toBe('Downtown Condos - Page 3')
  })
})
