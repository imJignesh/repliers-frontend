export const minYear = 1800
export const maxYear = new Date().getFullYear()

export const parseYear = (value: string | number) => {
  const text = String(value).trim()
  if (!/^\d{4}$/.test(text)) return null
  const year = Number(text)
  return year >= minYear && year <= maxYear ? year : null
}

/**
 * Audit R01: out-of-range or reversed years (e.g. 2099 to 1900) used to stay on
 * screen while the search silently ignored them. Invalid input now clears that
 * bound from the search and shows an error; the dialog blocks Apply meanwhile.
 */
export const getYearBuiltError = (
  from: string | number,
  to: string | number
) => {
  const outOfRange = `Enter a year from ${minYear} to ${maxYear}`
  const fromYear = from === '' ? undefined : parseYear(from)
  const toYear = to === '' ? undefined : parseYear(to)
  if (fromYear === null || toYear === null) return outOfRange
  if (fromYear && toYear && fromYear > toYear) {
    return '"From" year must not be after "To" year'
  }
  return null
}
