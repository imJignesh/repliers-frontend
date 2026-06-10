import pThrottle from 'p-throttle'

import content from '@configs/content'
import routes from '@configs/routes'

import { type ApiBoardArea, type ApiBoardCity } from 'services/API'
import { formatEnglishPrice } from 'utils/formatters'
import { sanitizeUrl } from 'utils/urls'

import { APILocations } from 'services/API'
import { filter as isFilterSegment, parseUrlFilters, parseUrlParams } from './_parsers'
import { fetchListings, fetchLocations } from './_requests'
import {
  extractCities,
  extractHoods,
  getCatalogLocation,
  getCatalogTitle,
  refineLocation
} from './_utils'
import { notFound } from 'next/navigation'
import { type Params, type SearchParams } from './page'

import { headers } from 'next/headers'
import { getProtocolHost } from 'utils/urls'

const disableSSG = process.env.DISABLE_SSG || false

export const generateCatalogMetadata = async ({
  params,
  searchParams
}: {
  params: Params
  searchParams: SearchParams
}) => {
  const host = getProtocolHost(await headers())
  const page = Number(searchParams.page) || 1
  const { slugs } = params

  const listingIdRegex = /^(.*)-(\d{5,8})(-(\d{1,3}))?$/
  const usZipRegex = /^\d{5}(-\d{4})?$/
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][- ]\d[A-Za-z]\d$/
  const isListingId = (s: string) => listingIdRegex.test(s)
  const isZipCode = (s: string) => usZipRegex.test(s) || canadianPostalRegex.test(s)

  const rawLocationSlugs = (slugs ?? []).filter(
    (seg) => !isFilterSegment(seg) && !isListingId(seg) && !isZipCode(seg)
  )

  const slugValidation = rawLocationSlugs.length
    ? await APILocations.validateSlugs(rawLocationSlugs)
    : {}

  const hasInvalidSlug = rawLocationSlugs.some((slug) => slug in slugValidation && slugValidation[slug] === null)
  if (hasInvalidSlug) {
    notFound()
  }

  const {
    filters,
    location: { area: urlArea, city: urlCity, neighborhood: urlHood },
    unknowns
  } = parseUrlParams(slugs)

  // Fetch areas and locations to perform refinement
  const [fetchAreas, dynamicAreasData] = await Promise.all([
    fetchLocations(urlCity, ''),
    APILocations.fetchAreas()
  ])

  // Build ApiBoardArea[] from the nested cities structure returned by /areas
  const formattedAreas: ApiBoardArea[] = (dynamicAreasData as any[]).map((a: any) => ({
    name: a.name,
    cities: (a.cities ?? []).map((c: any) => ({
      name: c.name,
      activeCount: Number(c.listing_count) || 0,
      location: { lat: 0, lng: 0 },
      state: 'ON',
      neighborhoods: (c.neighborhoods ?? []).map((name: string) => ({
        name,
        activeCount: 0,
        location: { lat: 0, lng: 0 }
      }))
    }))
  }))

  const finalAreas = formattedAreas.length ? formattedAreas : fetchAreas

  // Refine location
  const { area, city, hood } = refineLocation(finalAreas, urlArea, urlCity, urlHood, unknowns)

  const { count, listPrice } = await fetchListings({
    area,
    city,
    hood,
    filters: parseUrlFilters(filters),
    page
  })

  const catalogTitle = getCatalogTitle(filters)
  const displayCity = city || area || ''
  const shortLocation = getCatalogLocation(displayCity, hood)
  const fullLocation = getCatalogLocation(displayCity, hood, true)

  const lowestPrice = listPrice
    ? ` Prices starting at ${formatEnglishPrice(listPrice.min)}.`
    : ''

  const variables: Record<string, string> = {
    count: String(count),
    listingCount: String(count),
    catalogTitle,
    shortLocation,
    fullLocation,
    lowestPrice,
    startingPrice: listPrice ? formatEnglishPrice(listPrice.min).replace('$', '') : '',
    neighborhood: hood || '',
    city: displayCity,
    siteName: content.siteName
  }

  const interpolate = (template: string) => {
    return template.replace(
      /{{(.*?)}}/g,
      (_, key) => variables[key.trim()] || ''
    )
  }

  // @ts-ignore
  const templates = content.propertyMetadataTemplates?.location || {}

  let title = templates.title
    ? interpolate(templates.title)
    : `${count} ${catalogTitle} in ${shortLocation}`

  if (!hood && city) {
    const titleTrimmed = title.trim()
    const prefix = 'Condos For Sale,'
    if (titleTrimmed.startsWith(prefix)) {
      const rest = titleTrimmed.substring(prefix.length).trim()
      const parts = rest.split('|')
      const restCity = parts[0].trim()
      const restSuffix = parts.slice(1).join('|')
      title = `${restCity} Condos For Sale` + (restSuffix ? ` | ${restSuffix.trim()}` : '')
    }
  }

  const description = templates.description
    ? interpolate(templates.description)
    : `Find ${count} ${catalogTitle} in ${fullLocation}. Visit ${content.siteName} to see photos, prices & neighbourhood info.${lowestPrice}`

  const cleanDescription = description
    .replace(/in\s*,\s*/g, 'in ')
    .replace(/,\s*,\s*/g, ', ')
    .replace(/\s\s+/g, ' ')
    .trim()

  const meta: any = {
    title: title
      .replace(/\s\s+/g, ' ')
      .replace(/,\s*\|/g, ' |')
      .replace(/^, | ,$/g, '')
      .trim(),
    description: cleanDescription,
    alternates: {
      canonical: host + routes.listings + (slugs?.length ? '/' + slugs.join('/') : '')
    },
    openGraph: {
      url: host + routes.listings + (slugs?.length ? '/' + slugs.join('/') : '')
    },
    robots: {
      index: true,
      follow: true
    }
  }
  return meta
}

export const generateStaticParams = async () => {
  if (disableSSG) return []

  const locations = await fetchLocations('')
  const cities = extractCities(locations)
  const params: Params[] = []

  const throttle = pThrottle({
    limit: 5,
    interval: 1000
  })

  const throttledCities = cities.map(
    throttle(async (city: ApiBoardCity, index: number) => {
      // eslint-disable-next-line no-console
      console.log(`${index} processing ${city.name}`)

      params.push({ slugs: [sanitizeUrl(city.name)] })

      let hoods: any[] = []
      try {
        const cityLocations = await fetchLocations(city.name)
        hoods = extractHoods(cityLocations)
      } catch (e) {
        console.error(`Location "${city.name}" fetch failed`, e)
      }

      hoods.forEach((hood) => {
        params.push({
          slugs: [sanitizeUrl(city.name), sanitizeUrl(hood.name)]
        })
      })
    })
  )

  await Promise.all(throttledCities)
  return params
}
