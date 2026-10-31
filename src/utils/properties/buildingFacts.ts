/**
 * Honest building facts (audit RT02).
 *
 * The source sheet's "management" column holds the build year ("Built in
 * 2010", "Built in -") or the scale ("53 floors/ 501 units"), never a
 * management company, and its "Price Sqft" column holds the unit size range.
 * These helpers keep those values from being shown under the wrong label.
 * They mirror Building::cleanManagement / publicSizeRange in the backend, so
 * pages are correct before and after the backend change deploys.
 */

type BuildingFacts = {
  management?: string | null
  size_range?: string | null
  price_sqft?: string | null
}

export const cleanManagement = (value?: string | null): string | null => {
  const text = (value ?? '').trim()
  if (
    text === '' ||
    text === '-' ||
    text.toLowerCase() === 'n/a' ||
    /^built\s+in\b/i.test(text) ||
    /^\d+\s*floors?\s*\/\s*\d+\s*units?$/i.test(text)
  ) {
    return null
  }
  return text
}

const SIZE_RANGE = /^[\d,]+\s*sq\.?\s*ft\.?(\s*-\s*[\d,]+\s*sq\.?\s*ft\.?)?$/i

const asSizeRange = (value?: string | null): string | null => {
  const text = (value ?? '').trim()
  return text && !text.includes('$') && SIZE_RANGE.test(text) ? text : null
}

/** The building's unit size range, from `size_range` or the legacy field. */
export const getBuildingSizeRange = (
  building?: BuildingFacts | null
): string | null =>
  asSizeRange(building?.size_range) ?? asSizeRange(building?.price_sqft)
