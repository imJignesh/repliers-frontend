import { filterActionLabel } from './filterActionLabel'

describe('filterActionLabel', () => {
  it('counts listings by default', () => {
    expect(filterActionLabel(5)).toBe('Show 5 listings')
    expect(filterActionLabel(1)).toBe('Show 1 listing')
    expect(filterActionLabel(-1)).toBe('Show listings')
  })
  it('counts buildings in the Buildings view', () => {
    expect(filterActionLabel(5, false, 'building')).toBe('Show 5 buildings')
    expect(filterActionLabel(1, false, 'building')).toBe('Show 1 building')
    expect(filterActionLabel(0, false, 'building')).toBe('Show 0 buildings')
    expect(filterActionLabel(-1, false, 'building')).toBe('Show buildings')
  })
  it('shows no number while the count is loading', () => {
    expect(filterActionLabel(null, false, 'building')).toBe('Show buildings')
    expect(filterActionLabel(null)).toBe('Show listings')
  })
  it('asks to fix invalid filters', () => {
    expect(filterActionLabel(5, true, 'building')).toBe('Fix highlighted filters')
  })
})
