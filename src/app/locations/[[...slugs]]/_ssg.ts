import pThrottle from 'p-throttle'

import content from '@configs/content'

import { type ApiBoardCity } from 'services/API'
import { formatEnglishPrice } from 'utils/formatters'
import { sanitizeUrl } from 'utils/urls'

import { parseUrlFilters, parseUrlParams } from './_parsers'
import { fetchListings, fetchLocations } from './_requests'
import {
  extractCities,
  extractHoods,
  getCatalogLocation,
  getCatalogTitle
} from './_utils'
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

  const {
    filters,
    location: { area, city, neighborhood: hood }
  } = parseUrlParams(slugs)

  const { count, listPrice } = await fetchListings({
    area,
    city,
    hood,
    filters: parseUrlFilters(filters),
    page
  })

  const catalogTitle = getCatalogTitle(filters)
  const shortLocation = getCatalogLocation(city, hood)
  const fullLocation = getCatalogLocation(city, hood, true)

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
    city: city || '',
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

  const title = templates.title
    ? interpolate(templates.title)
    : `${count} ${catalogTitle} in ${shortLocation}`

  const description = templates.description
    ? interpolate(templates.description)
    : `Find ${count} ${catalogTitle} in ${fullLocation}. Visit ${content.siteName} to see photos, prices & neighbourhood info.${lowestPrice}`

  const meta: any = {
    title: title
      .replace(/\s\s+/g, ' ')
      .replace(/,\s*\|/g, ' |')
      .replace(/^, | ,$/g, '')
      .trim(),
    description: description.replace(/\s\s+/g, ' ').trim(),
    alternates: {
      canonical: host + '/locations/' + slugs.join('/')
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
