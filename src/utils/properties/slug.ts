import propsConfig from '@configs/properties'

import { type PropertyAddress } from 'services/API'

/**
 * Build the address portion of a listing slug.
 *
 * This lives apart from `sanitizers.ts` on purpose: the slug rules are also
 * needed by `middleware.ts`, which runs on the edge, and `sanitizers.ts` pulls
 * in `libphonenumber-js`. Keeping this module dependency-light keeps that out
 * of the middleware bundle.
 *
 * The output has to stay byte-identical to the backend's `Str::slug()`, which
 * is what writes the sitemap URLs. If the two ever drift, the canonical tag
 * starts pointing at a URL that is not the one Google crawled.
 */
export const slugifyAddress = (address: PropertyAddress) => {
  const {
    unitNumber = '',
    streetNumber = '',
    streetName = '',
    streetSuffix = '',
    streetDirection = '',
    city = '',
    zip = ''
  } = address || ({} as PropertyAddress)

  return (
    [
      unitNumber,
      streetNumber,
      streetName,
      streetSuffix,
      streetDirection,
      city,
      zip
    ]
      .map((part) =>
        part?.trim().replaceAll(propsConfig.scrubbedDataString, '')
      )
      .filter(Boolean)
      .join('-')
      // Fold accents down to their ASCII base letter (é -> e) to match Str::slug().
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // '#' is dropped rather than hyphenated so '#5' stays '5', not '-5'.
      .replace(/#/g, '')
      // Everything that is not alphanumeric collapses to a single hyphen. This is
      // an allow-list on purpose: display labels reach this function raw (e.g. the
      // city 'Midtown | Central'), and a deny-list silently passes through
      // whatever punctuation it was not written to expect -- which is how the
      // literal '|' ended up inside live canonical URLs.
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
  )
}
