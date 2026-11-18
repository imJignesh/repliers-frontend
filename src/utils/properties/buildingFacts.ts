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

/**
 * Audit R03 (4 and 6 Nov 2026): 875 Queen East's sheet row reads
 * "Floors: 122 | Total Units: 7" while its description says 7 storeys and
 * 118 units. A building cannot have more floors than units, so such a summary
 * contradicts itself and is held back (not shown, not used in structured
 * data) until the building sheet is corrected.
 */
export const getBuildingScale = (value?: string | null): string | null => {
  const text = String(value ?? '').trim()
  if (!text) return null
  const read = (re: RegExp) => {
    const m = re.exec(text)
    return m ? Number(m[1].replace(/,/g, '')) : null
  }
  const floors = read(/floors?\s*:\s*([\d,]+)/i)
  const units = read(/total\s*units\s*:\s*([\d,]+)/i)
  if (floors !== null && units !== null && units > 0 && floors > units) return null
  // Audit 4 C03: "Floors: | Total Units:" (no numbers) is an empty fact.
  if (!/\d/.test(text)) return null
  if (/floors?\s*:/i.test(text) || /total\s*units\s*:/i.test(text)) {
    const parts = [
      floors !== null ? `Floors: ${floors}` : null,
      units !== null ? `Total Units: ${units}` : null
    ].filter(Boolean)
    return parts.length ? parts.join(' | ') : null
  }
  return text
}

/**
 * Audit 4 C03: the sheet's build year is "Built: 2014" or a bare "Built:".
 * Returns the text only when it carries a year.
 */
export const getBuiltYear = (value?: string | null): string | null => {
  const text = String(value ?? '').trim()
  return /\d/.test(text) ? text : null
}
