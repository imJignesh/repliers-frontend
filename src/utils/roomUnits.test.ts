import { roomUnitSuffix } from './roomUnits'

describe('roomUnitSuffix', () => {
  it('labels metric sizes', () => {
    expect(
      roomUnitSuffix([
        { length: '3.05', width: '4.39' },
        { length: '2.6', width: null }
      ])
    ).toBe(' m')
  })
  it('leaves feet-like sizes unlabelled', () => {
    expect(
      roomUnitSuffix([
        { length: '16.57', width: '17.85' },
        { length: '3.1', width: '3.2' }
      ])
    ).toBe('')
  })
  it('ignores zero, missing and non-numeric values', () => {
    expect(roomUnitSuffix([{ length: '0.00', width: 'null' }])).toBe('')
    expect(roomUnitSuffix([])).toBe('')
    expect(roomUnitSuffix(undefined)).toBe('')
  })
})
