import dayjs from 'dayjs'

import propsConfig from '@configs/properties'

import { type Property, type PropertyAddress } from 'services/API'

import { capitalize, joinNonEmpty } from '../strings'
import { getCDNPath } from '../urls'

import { sanitizeScrubbed, sanitizeStreetNumber } from './sanitizers'
import { getSeoStatus, getSeoTitle, getSeoType, getSeoUrl } from './seo'
import { getBathrooms, getBedrooms, scrubbed, sold } from '.'
import contentConfig from '@configs/content'
import { formatEnglishPrice } from 'utils/formatters'



export const formatBuildingAddress = (
  address: Partial<PropertyAddress>,
  removeScrubbed: boolean = false
) => {
  const {

    streetNumber,
    streetName,
    streetSuffix,
    streetDirection
  } = address


  return joinNonEmpty(
    [

      sanitizeStreetNumber(streetNumber || ''),
      capitalize(streetName?.toLowerCase()),
      capitalize(streetSuffix?.toLowerCase()),
      streetDirection?.toUpperCase() || ''
    ].map((value) => (removeScrubbed ? sanitizeScrubbed(value) : value)),
    ' '
  )
}


export const formatShortAddress = (
  address: Partial<PropertyAddress>,
  removeScrubbed: boolean = false
) => {
  const {
    unitNumber,
    streetNumber,
    streetName,
    streetSuffix,
    streetDirection
  } = address
  const sanitizedUnit = unitNumber?.replaceAll(/(#|APT)/g, '').trim()
  const formattedUnit =
    sanitizedUnit && sanitizedUnit !== streetNumber ? `#${sanitizedUnit} -` : ''

  return joinNonEmpty(
    [
      // special case for unitNumber
      removeScrubbed && scrubbed(unitNumber) ? '' : formattedUnit,
      sanitizeStreetNumber(streetNumber || ''),
      capitalize(streetName?.toLowerCase()),
      capitalize(streetSuffix?.toLowerCase()),
      streetDirection?.toUpperCase() || ''
    ].map((value) => (removeScrubbed ? sanitizeScrubbed(value) : value)),
    ' '
  )
}

export const formatFullAddress = (
  address: Partial<PropertyAddress>,
  removeScrubbed: boolean = false
): string => {
  const { city, state, zip } = address
  return joinNonEmpty(
    [
      formatShortAddress(address, removeScrubbed),
      capitalize(city?.toLowerCase()),
      capitalize(state),
      scrubbed(zip) ? zip : String(zip || '').toUpperCase()
    ].map((value) => (removeScrubbed ? sanitizeScrubbed(value || '') : value)),
    ', '
  ).replace(/\s+/g, ' ')
}

export const formatMetadata = (
  property: Property,
  host?: string | null,
  options?: {
    type?: 'listing' | 'building'
    buildingName?: string
  }
) => {
  const {
    details,
    images,
    address,
    listPrice,
    soldPrice
  } = property
  const { description, propertyType } = details
  const { neighborhood, city } = address

  const openGraph = {
    images: getCDNPath(images[0], 'small'),
    url: host + getSeoUrl(property)
  }

  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  
  const priceToUse = sold(property) ? soldPrice : listPrice
  const formattedPrice = (!scrubbed(priceToUse) && priceToUse) ? formatEnglishPrice(priceToUse) : ''

  const type = options?.type || 'listing'

  const variables: Record<string, string> = {
    status: getSeoStatus(property),
    propertyType: getSeoType(propertyType || ''),
    neighborhood: capitalize(neighborhood || ''),
    city: capitalize(city || ''),
    address: type === 'building'
      ? formatBuildingAddress(address, true)
      : formatShortAddress(address, true),
    price: formattedPrice,
    beds: beds.count.toString(),
    baths: baths.count.toString(),
    buildingName: options?.buildingName || ''
  }

  const interpolate = (template: string) => {
    return template.replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || '')
  }
  // @ts-ignore
  const templates = contentConfig.propertyMetadataTemplates?.[type] || {}

  let title = templates.title ? interpolate(templates.title) : getSeoTitle(property)
  
  // Cleanup artifacts like " -  - " if price or building name is empty
  title = title.replace(/\s\s+/g, ' ').replace(/ - - /g, ' - ').replace(/^ - | - $/g, '')

  let finalDescription = templates.description ? interpolate(templates.description) : description
  finalDescription = scrubbed(finalDescription) ? propsConfig.scrubbedDescriptionLabel : finalDescription

  return {
    title,
    description: finalDescription,
    openGraph,
    alternates: {
      canonical: host + getSeoUrl(property)
    },
    robots: {
      index: type !== 'listing',
      follow: type !== 'listing'
    }
  }
}

export const formatAreaName = (area: string) =>
  capitalize(area).replace(/\//g, ' / ').replace(/\s+/g, ' ')

export const formatMultiLineText = (text: string) => {
  const trimmedText = text.replace('<-more->', ' ').replace(/\r/g, '').trim()
  const paragraphDivider = trimmedText.includes('\n\n') ? '\n\n' : '\n'
  return trimmedText
    .split(paragraphDivider)
    .map((p) => `<p style="margin: 16px 0">${p}</p>`)
    .join('')
    .replace(/\s+/g, ' ')
}

export const formatRawData = (raw: string | undefined) => {
  return !raw || !raw.trim()
    ? ''
    : String(raw)
      .trim()
      .replace(/\r/g, '')
      .replace(/\n\n/g, '<br />')
      .replace(/,/g, ', ')
      .replace(/\//g, ' / ')
      .replace(/\s+/g, ' ')
}

export const formatOpenHouseTimeRange = (start: string, end: string) => {
  const startDate = dayjs(start).format('ddd, MMM D, ')

  const startTime =
    dayjs(start).format('h') +
    (dayjs(start).minute() ? `:${dayjs(start).minute()}` : '')
  const endTime =
    dayjs(end).format('h') +
    (dayjs(end).minute() ? `:${dayjs(end).minute()}` : '')

  const startTimeSuffix = dayjs(start).format('A')
  const endTimeSuffix = dayjs(end).format('A')

  return `${startDate}${startTime !== endTime
    ? `${startTime}${startTimeSuffix !== endTimeSuffix ? startTimeSuffix : ''}-`
    : ''
    }${endTime}${endTimeSuffix}`
}
