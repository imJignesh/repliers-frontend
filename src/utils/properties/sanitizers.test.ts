import { property1, property2, property3, property4 } from './__mocks__'
import { sanitizeAddress } from './sanitizers'

describe('utils/properties/sanitizers', () => {
  it('should correctly sanitize addresses', () => {
    expect(sanitizeAddress(property1.address)).toBe(
      'ph3-135-lower-barrette-way-east-ottawa-k1l-7z9'
    )
    expect(sanitizeAddress(property2.address)).toBe(
      '135-lower-barrette-way-ottawa-k1l-7z9'
    )
    expect(sanitizeAddress(property3.address)).toBe(
      '13-5-d-artagnan-bay-ottawa'
    )
    expect(sanitizeAddress(property4.address)).toBe('')
  })

  // PC-01: 'Midtown | Central' is a real city display label in the feed. The
  // previous deny-list left the '|' untouched, so it reached live canonical
  // tags verbatim as '...-midtown-|-central-...'.
  it('collapses display-label punctuation instead of passing it through', () => {
    expect(
      sanitizeAddress({
        streetNumber: '412',
        streetName: '188 Eglinton Ave E',
        city: 'Midtown | Central',
        zip: 'M4P 2X7'
      } as any)
    ).toBe('412-188-eglinton-ave-e-midtown-central-m4p-2x7')
  })

  it('never emits a pipe, space or repeated hyphen', () => {
    const slug = sanitizeAddress({
      unitNumber: '#502',
      streetName: 'Bayview  Ave',
      city: 'Midtown | Central',
      zip: 'M4G 3A7'
    } as any)
    expect(slug).not.toMatch(/[|\s]/)
    expect(slug).not.toMatch(/--/)
    expect(slug).toBe('502-bayview-ave-midtown-central-m4g-3a7')
  })

  it('folds accents to ASCII so it matches the backend slug', () => {
    expect(
      sanitizeAddress({ streetName: 'Rue Beauprés', city: 'Montréal' } as any)
    ).toBe('rue-beaupres-montreal')
  })
})
