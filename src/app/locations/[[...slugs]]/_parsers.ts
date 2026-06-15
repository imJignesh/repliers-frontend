import { type ListingType, listingTypes } from '@configs/filters'
import locationConfig from '@configs/location'
import searchConfig from '@configs/search'

import { type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'
import { capitalize } from 'utils/strings'

import { compoundPrefixes, filterSuffixes } from './_constants'

const allowedTypes = new Set([
  'houses', 'condos', 'townhomes',
  'semiDetached', 'multiFamily', 'land', 'business', 'commercial'
])

const allowedStatuses = new Set([
  'sold', 'all'
])

const allowedSorts = new Set([
  'createdOnAsc', 'createdOnDesc', 'updatedOnAsc', 'updatedOnDesc',
  'listPriceAsc', 'listPriceDesc', 'random', 'soldDateAsc', 'soldDateDesc',
  'soldPriceAsc', 'soldPriceDesc', 'distanceAsc', 'distanceDes',
  'qualityAsc', 'qualityDesc'
])

const priceRegex = /^\$?\d+(?:,\d+)*(?:\.\d+)?[km]?$/i
const bedBathGarageParkingRegex = /^\d+(?:\.\d+)?\+?-(?:bed|beds|bedroom|bedrooms|bath|baths|bathroom|bathrooms|garage|garages|parking|parkings)$/i

const isValidFilter = (f: string): boolean => {
  if (allowedTypes.has(f)) return true
  if (allowedStatuses.has(f)) return true

  if (f.startsWith('sort-')) {
    const sortKey = f.substring(5)
    return allowedSorts.has(sortKey)
  }

  if (f.startsWith('above-')) {
    const price = f.substring(6)
    return priceRegex.test(price)
  }

  if (f.startsWith('below-')) {
    const price = f.substring(6)
    return priceRegex.test(price)
  }

  if (bedBathGarageParkingRegex.test(f)) {
    return true
  }

  return false
}

export const filter = (segment: string) => {
  const parsed = parseFiltersSegment(segment)
  if (!parsed.length) return false
  return parsed.every(isValidFilter)
}

const usZipRegex = /^\d{5}(-\d{4})?$/
const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][- ]\d[A-Za-z]\d$/

const zipCode = (segment: string) =>
  usZipRegex.test(segment) || canadianPostalRegex.test(segment)

const listingRegex = /^(.*)-(\d{5,8})(-(\d{1,3}))?$/
const listing = (segment: string) => listingRegex.test(segment)

export const beautify = (label: string) =>
  capitalize(
    decodeURIComponent(
      label
        .replace('-area', '')
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, '')
        // Replace multiple dashes with single dash for word separators
        .replaceAll(/(-){3,}/g, ' - ')
        // Replace single dashes between non-spaces with space
        .replaceAll(/(\S)-+(\S)/g, '$1 $2')
    ).trim()
  )

function isCompoundTokens(a: string, b: string) {
  if (filterSuffixes.includes(b)) {
    return true
  }

  if (compoundPrefixes.includes(a)) {
    return true
  }

  if (a === 'new' && b === 'listings') {
    return true
  }

  return false
}

function parseFiltersSegment(segment: string) {
  const tokens = segment.split('-')
  const filters = [] as string[]

  while (tokens.length) {
    const a = tokens[0]
    const b = tokens[1]

    if (isCompoundTokens(a, b)) {
      filters.push(`${a}-${b}`)
      tokens.splice(0, 2)
    } else {
      filters.push(a)
      tokens.shift()
    }
  }

  return filters
}

export const parseUrlParams = (params: string[]) => {
  const initialState = {
    location: {
      state: locationConfig.stateCode,
      area: '',
      city: '',
      neighborhood: '',
      zipCode: '',
      address: ''
    },
    filters: [] as string[],
    localAddress: '',
    listingId: '',
    boardId: '',
    unknowns: [] as string[]
  }

  const result = (params || []).reduce((acc, segment) => {
    if (filter(segment)) {
      acc.filters = parseFiltersSegment(segment)
    } else if (listing(segment)) {
      const match = segment.match(listingRegex)
      if (match) {
        acc.localAddress ||= beautify(match[1])
        acc.listingId ||= match[2]
        acc.boardId = match[4] || String(searchConfig.defaultBoardId)
      }
    } else if (zipCode(segment)) {
      acc.location.zipCode = beautify(segment).toUpperCase()
    } else if (!acc.location.area && segment.endsWith('-area')) {
      acc.location.area = beautify(segment)
    } else if (!acc.location.city) {
      acc.location.city = beautify(segment)
    } else if (!acc.location.neighborhood) {
      acc.location.neighborhood = beautify(segment)
    } else {
      acc.unknowns.push(segment)
    }
    return acc
  }, initialState)
  return result
}

export const parseUrlPrice = (price: string) => {
  const cleanPrice = price
    .toLowerCase()
    .replace('below-', '')
    .replace('above-', '')
    .replace('$', '')
    .replace(',', '')
  if (cleanPrice.includes('m')) {
    return 1_000_000 * toSafeNumber(cleanPrice.replace('m', ''))
  }
  if (cleanPrice.includes('k')) {
    return 1_000 * toSafeNumber(cleanPrice.replace('k', ''))
  }
  return toSafeNumber(cleanPrice)
}

export const parseUrlNumber = (string: string) => {
  return toSafeNumber(string.split('-')[0])
}

export const parseListingType = (filters: string[]) =>
  filters.reduce((prev, cur) => {
    switch (cur) {
      // aliases
      case 'house':
      case 'houses':
      case 'home':
      case 'homes':
        return 'condo'
      // aliases
      case 'condos':
      case 'apartment':
      case 'apartments':
        return 'condo'
      case 'townhomes':
        return 'condo'
    }
    // strict match
    if (listingTypes.includes(cur as ListingType)) {
      return cur
    }
    return prev
    // default listingType
  }, 'condo') as ListingType

export const parseUrlFilters = (filters: string[]) => {
  const searchFilters: Partial<Filters> = {
    // defaults
    listingStatus: 'active',
    listingType: 'condo',
    sortBy: 'createdOnDesc'
  }

  filters.forEach((filter) => {
    // No rent filters supported


    // if (filter === 'open') {
    //   // eslint-disable-next-line prefer-destructuring
    //   searchFilters.minOpenHouseDate = new Date().toISOString().split('T')[0]
    // }

    // non strict equality
    if (filter.startsWith('sort-')) {
      searchFilters.sortBy = filter.replace('sort-', '') as ApiSortBy
    }
    if (filter.startsWith('below-')) {
      searchFilters.maxPrice = parseUrlPrice(filter)
    }
    if (filter.startsWith('above-')) {
      searchFilters.minPrice = parseUrlPrice(filter)
    }
    if (filter.includes('-bed')) {
      searchFilters.minBeds = parseUrlNumber(filter)
    }
    if (filter.includes('-bath')) {
      searchFilters.minBaths = parseUrlNumber(filter)
    }
    if (filter.includes('-garage')) {
      searchFilters.minGarageSpaces = parseUrlNumber(filter)
    }
    if (filter.includes('-parking')) {
      searchFilters.minParkingSpaces = parseUrlNumber(filter)
    }
  })

  return {
    ...searchFilters,
    listingType: parseListingType(filters)
  }
}