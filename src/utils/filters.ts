import { defaultAdvancedFilters, priceBuckets } from '@configs/filters'

import { type Filters } from 'services/Search'

// Upper bound for the price-range slider. The API can return buckets up into the
// billions (a stray/ultra-high listing or a default top bucket), which made the
// slider max read "$500B". Anything at or above the cap collapses into a single
// `${cap}+` bucket so the slider stays data-driven but never exceeds this.
const priceCaps: Record<'sale' | 'rent', number> = {
  sale: 30000000, // $30M
  rent: 100000 // $100k / mo
}

export function mergeBuckets(
  buckets: Record<string, number>,
  config: 'sale' | 'rent' = 'sale'
) {
  const limits = priceBuckets[config]
  let currentLimitIndex = 0
  let counter = 0
  let aggregatedMin = 0
  let aggregatedValue = 0

  const result: Record<string, number> = {}
  const keys = Object.keys(buckets)
    .map((key) => {
      const [min, max] = key.includes('+')
        ? [parseInt(key, 10), undefined]
        : key.split('-').map(Number)
      return { min, max, key }
    })
    .sort((a, b) => a.min - b.min)

  keys.forEach(({ min, max, key }, index) => {
    while (
      currentLimitIndex < limits.length &&
      min >= limits[currentLimitIndex].from
    ) {
      currentLimitIndex += 1
      counter = 0
      aggregatedMin = 0
      aggregatedValue = 0
    }

    if (currentLimitIndex > 0) {
      aggregatedValue += buckets[key]
      counter += 1

      if (aggregatedMin === 0) {
        aggregatedMin = min
      }

      const { steps } = limits[currentLimitIndex - 1]
      const isLastElement = index === keys.length - 1
      const isPlusElement = max === undefined

      if (counter === steps || isLastElement || isPlusElement) {
        const rangeKey = isPlusElement
          ? `${aggregatedMin}+`
          : `${aggregatedMin}-${max}`
        result[rangeKey] = aggregatedValue
        counter = 0
        aggregatedValue = 0
        aggregatedMin = 0
      }
    } else {
      result[key] = buckets[key]
    }
  })

  // Add the remaining buckets if any
  if (aggregatedValue > 0) {
    const lastKey = keys[keys.length - 1]
    const rangeKey =
      lastKey.max === undefined
        ? `${aggregatedMin}+`
        : `${aggregatedMin}-${lastKey.max}`
    result[rangeKey] = aggregatedValue
  }

  // Cap the top of the slider: collapse every bucket at/above the cap into a
  // single `${cap}+` bucket so a stray ultra-high value can't blow up the max.
  const cap = priceCaps[config]
  const capped: Record<string, number> = {}
  let overflow = 0
  Object.entries(result).forEach(([key, count]) => {
    const min = key.includes('+')
      ? parseInt(key, 10)
      : Number(key.split('-')[0])
    if (min >= cap) {
      overflow += count
    } else {
      capped[key] = count
    }
  })
  if (overflow > 0) {
    capped[`${cap}+`] = (capped[`${cap}+`] ?? 0) + overflow
  }

  return capped
}

const inRange = (value: number, range: string) => {
  const [min, max] = range.split('-').map(parseFloat)
  return value >= min && value < max
}

export const getBucketIndex = (value: number, bucketKeys: string[]) => {
  const index = bucketKeys.findIndex((key) => inRange(value, key))
  if (index === -1) return bucketKeys.length - 1
  return index
}

export const nonDefaultFilter = (entry: [string, any], defaults: Filters) => {
  const [key, value] = entry
  // WARN: skip AI filters
  if (key === 'imageSearchItems') return false
  const defaultValue = defaults[key as keyof Filters]
  if (
    typeof value !== 'object' &&
    typeof defaultValue !== 'undefined' &&
    value != defaultValue
  ) {
    return true
  } else if (Array.isArray(value) && value.filter(Boolean).length > 0) {
    // WARN: any array with at least one truthy value is considered as non-default filter
    return true
  }
  return false
}

export const countAdvancedFilters = (filters: Filters) => {
  let counter = 0
  // compare against default values used AdvancedFiltersDialog
  Object.entries(filters).forEach((entry) => {
    if (nonDefaultFilter(entry, defaultAdvancedFilters)) counter += 1
  })
  return counter
}

export const countAiQualityFilters = (filters: Filters) => {
  let counter = 0
  Object.entries(filters).forEach(([key, value]) => {
    if (
      key.indexOf('Quality') !== -1 &&
      Boolean(value) // truthy value
    ) {
      counter += 1
    }
  })

  return counter
}
