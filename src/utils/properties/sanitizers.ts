import propsConfig from '@configs/properties'

import { type PropertyAddress } from 'services/API'

import { slugifyAddress } from './slug'

export const sanitizeScrubbed = (value: string) =>
  String(value).replaceAll(propsConfig.scrubbedDataString, '')

export const sanitizeStreetNumber = (value: string) => {
  const sanitized = sanitizeScrubbed(String(value))
  return sanitized === '' || sanitized.match(/^0+$/) ? '' : value
}

export const sanitizeAddress = (address: PropertyAddress) =>
  slugifyAddress(address)

export const sanitizeEmail = (value: string | null | undefined) => {
  if (!value) return ''
  return String(value).trim().toLowerCase()
}

export const isPureAmenity = (amenity: string): boolean => {
  if (!amenity) return false
  // Remove URLs (starting with http/https or containing .com/ .ca etc with path)
  // The user example: [https://www.beanfield.com/residential/?utm_source=condos.ca&utm_medium=condos.ca_website&utm_campaign=building_amenities_link]
  const urlPattern = /https?:\/\/[^\s\]]+/i
  if (urlPattern.test(amenity)) return false

  // Also check if it's just a bracketed link or contains suspicious text
  if (amenity.includes('beanfield.com')) return false

  return true
}
