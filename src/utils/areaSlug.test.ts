import { describe, expect, it } from '@jest/globals'

import { toAreaSlug } from './areaSlug'

describe('toAreaSlug', () => {
  it.each([
    ["Fletcher's Creek South", 'fletchers-creek-south'],
    ["Tam O'Shanter-Sullivan", 'tam-oshanter-sullivan'],
    ["O'Neill", 'oneill'],
    ['Meadowlands/Crestview', 'meadowlandscrestview'],
    ["Kanata - Morgan's Grant/South March", 'kanata-morgans-grantsouth-march'],
    ['Stittsville (North)', 'stittsville-north'],
    ['Yonge-St. Clair', 'yonge-st-clair'],
    ['Downtown', 'downtown'],
    ['fletchers-creek-south', 'fletchers-creek-south']
  ])('%s -> %s', (name, slug) => {
    expect(toAreaSlug(name)).toBe(slug)
  })
})
