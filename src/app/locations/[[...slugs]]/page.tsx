import { features } from 'features'
import { permanentRedirect } from 'next/navigation'

import { Page404Template, PageTemplate } from '@templates'
import CatalogPageContent from '@pages/catalog'

import { generateMetadata as generatePropertyMetadata } from 'app/listing/[[...listingName]]/page'
import PropertyPage from 'app/listing/[[...listingName]]/page'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  APILocations
} from 'services/API'

import { filter as isFilterSegment, parseUrlFilters, parseUrlParams } from './_parsers'
import { beautify } from './_parsers'
import { fetchListings, fetchLocations } from './_requests'
import { generateCatalogMetadata } from './_ssg'
import { extractCities, extractLocation, refineLocation } from './_utils'

// catalog pages CANT BE STATICALLY GENERATED (SSG)
// because we need a token cookie to fetch listings from the client side
export const dynamic = 'force-dynamic'
export const revalidate = 86400

export type Params = {
  slugs: string[]
}

export type SearchParams = {
  page?: number
}

type LocationsPageProps = {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}

// export { genetareStaticParams } from './_ssg'

export const generateMetadata = async (props: LocationsPageProps) => {
  const params = await props.params
  const searchParams = await props.searchParams
  const { listingId, boardId, localAddress } = parseUrlParams(params.slugs)

  if (listingId) {
    return generatePropertyMetadata({
      params: { listingName: [`${localAddress}-${listingId}`] },
      searchParams: { boardId }
    })
  }

  return generateCatalogMetadata({ params, searchParams })
}

const LocationsCatalogPage = async (props: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const page = Number(searchParams.page) || 1
  const { slugs } = params

  if (!features.listings) return <Page404Template />

  const {
    filters,
    boardId,
    listingId,
    localAddress,
    location: { area: urlArea, city: urlCity, neighborhood: urlHood },
    unknowns
  } = parseUrlParams(slugs)

  // ─── Slug validation ────────────────────────────────────────────────────────
  // Extract the raw URL segments that are location slugs (not filters / listing
  // IDs / zip codes).  Each must exist in the Laravel location tree; if any is
  // unknown we return a 404 immediately — before fetching any listing data.
  // Validation runs in parallel with the area/area-data fetches below.
  const listingIdRegex = /^(.*)-(\d{5,8})(-(\d{1,3}))?$/
  const usZipRegex = /^\d{5}(-\d{4})?$/
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][- ]\d[A-Za-z]\d$/
  const isListingId = (s: string) => listingIdRegex.test(s)
  const isZipCode = (s: string) => usZipRegex.test(s) || canadianPostalRegex.test(s)

  const rawLocationSlugs = (slugs ?? []).filter(
    (seg) => !isFilterSegment(seg) && !isListingId(seg) && !isZipCode(seg)
  )

  const currentPath = '/locations' + (slugs?.length ? '/' + slugs.join('/') : '')

  // Fetch data needed for identification
  // Pass empty neighborhood to fetch all neighborhoods in the city for loose matching later
  const [fetchAreas, dynamicAreasData, slugValidation, redirectInfo] = await Promise.all([
    fetchLocations(urlCity, ''),
    APILocations.fetchAreas(),
    rawLocationSlugs.length
      ? APILocations.validateSlugs(rawLocationSlugs)
      : Promise.resolve({} as Record<string, string | null>),
    APILocations.lookupRedirect(currentPath)
  ])

  // If redirect exists in the database, redirect permanently
  if (redirectInfo?.destination) {
    permanentRedirect(redirectInfo.destination)
  }

  // 404 if any location segment is unknown to the database
  const hasInvalidSlug = rawLocationSlugs.some((slug) => slug in slugValidation && slugValidation[slug] === null)
  if (hasInvalidSlug) return <Page404Template />

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

  // Refine location identification
  const { area, city, hood } = refineLocation(finalAreas, urlArea, urlCity, urlHood, unknowns)

  // render property page component if listingId is present and emulate its old url format
  if (listingId) {
    return (
      <PropertyPage
        params={{ listingName: [`${localAddress}-${listingId}`] }}
        searchParams={{ boardId }}
      />
    )
  }

  const searchFilters = parseUrlFilters(filters)
  const { listings, count } = await fetchListings({
    area,
    city,
    hood,
    filters: searchFilters,
    page
  })

  if (page > 1 && !listings.length) return <Page404Template />

  const byCount = (a: any, b: any) => b.activeCount - a.activeCount

  const currentArea = area ? finalAreas.find((a) => a.name === area) : null
  const currentLocation = city
    ? extractLocation(finalAreas, city, hood)
    : undefined
  const citiesList = extractCities(
    currentArea ? [currentArea] : finalAreas
  ).sort(byCount)

  // Fetch area direct children: for an area returns [{name, neighborhoods}], for a city returns string[]
  let hoods: any[] = []
  const targetForNeighborhoods = city || area
  if (targetForNeighborhoods) {
    const dynamicData = await APILocations.fetchAreaNeighborhoods(
      targetForNeighborhoods,
      true
    )

    if (dynamicData.length > 0) {
      const first = dynamicData[0]
      const isNested = typeof first === 'object' && first !== null && 'neighborhoods' in first

      if (!isNested) {
        // City-level: flat neighborhood objects
        hoods = (dynamicData as any[]).map((n) => ({
          name: n.name,
          activeCount: Number(n.listing_count) || 0,
          location: { lat: 0, lng: 0 }
        }))
      } else {
        // Area-level: nested [{name, neighborhoods}] — use city names as hoods
        hoods = (dynamicData as any[]).map((c) => ({
          name: c.name,
          activeCount: Number(c.listing_count) || 0,
          location: { lat: 0, lng: 0 },
          neighborhoods: (c.neighborhoods ?? []).map((n: any) => ({
            name: typeof n === 'string' ? n : n.name,
            activeCount: typeof n === 'string' ? 0 : (Number(n.listing_count) || 0),
            location: { lat: 0, lng: 0 }
          }))
        }))
      }
    } else {
      // Fallback to computed data from areas
      hoods =
        city && currentLocation
          ? (currentLocation as ApiBoardCity).neighborhoods || []
          : currentArea
            ? currentArea.cities
            : []
    }
  }

  return (
    <PageTemplate>
      <CatalogPageContent
        listings={listings}
        count={count}
        page={page}
        area={area}
        city={city}
        hood={hood}
        areas={finalAreas}
        hoods={hoods as any}
        cities={citiesList}
        location={currentLocation}
        urlFilters={filters}
        searchFilters={searchFilters}
      />
    </PageTemplate>
  )
}

export default LocationsCatalogPage
