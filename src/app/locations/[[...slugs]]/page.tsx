import { features } from 'features'

import { Page404Template, PageTemplate } from '@templates'
import CatalogPageContent from '@pages/catalog'

import { generateMetadata as generatePropertyMetadata } from 'app/listing/[[...listingName]]/page'
import PropertyPage from 'app/listing/[[...listingName]]/page'

import { APILocations, type ApiBoardArea, type ApiBoardCity } from 'services/API'

import { parseUrlFilters, parseUrlParams } from './_parsers'
import { fetchListings, fetchLocations } from './_requests'
import { generateCatalogMetadata } from './_ssg'
import { extractCities, extractLocation } from './_utils'
import { beautify } from './_parsers'

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

  // Fetch data needed for identification
  // Pass empty neighborhood to fetch all neighborhoods in the city for loose matching later
  const fetchAreas = await fetchLocations(urlCity, '')
  const dynamicAreasData = await APILocations.fetchAreas()
  const formattedAreas: ApiBoardArea[] = dynamicAreasData.map((a: any) => ({
    name: a.name,
    cities: a.neighborhoods.map((name: string) => ({
      name,
      activeCount: 0,
      location: { lat: 0, lng: 0 },
      state: 'ON'
    }))
  }))

  const finalAreas = formattedAreas.length ? formattedAreas : fetchAreas

  // Refine location identification
  let area = urlArea
  let city = urlCity
  let hood = urlHood

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!area) {
    const asArea = finalAreas.find((a) => normalize(a.name) === normalize(city));
    if (asArea) {
      area = asArea.name;

      const slug2 = hood;
      const asCity = asArea.cities?.find((c: any) => normalize(c.name || c) === normalize(slug2));

      if (asCity) {
        city = typeof asCity === 'string' ? asCity : asCity.name;
        hood = unknowns.length > 0 ? beautify(unknowns.shift() as string) : '';
      } else {
        let foundCity = null;
        let foundHood = null;
        if (asArea.cities) {
          for (const c of asArea.cities) {
            const h = c.neighborhoods?.find((n: any) => normalize(n.name || n) === normalize(slug2));
            if (h) {
              foundCity = c.name;
              foundHood = typeof h === 'string' ? h : h.name;
              break;
            }
          }
        }

        if (foundHood) {
          city = foundCity;
          hood = foundHood;
        } else {
          city = slug2 || '';
          hood = unknowns.length > 0 ? beautify(unknowns.shift() as string) : '';
        }
      }
    }
  }

  // extract the correct neighborhood name from the list of areas
  if (hood && city) {
    const location = extractLocation(finalAreas, city, hood)
    if (location && 'name' in location) {
      hood = location.name
    }
  }

  console.log({ filters, boardId, listingId, localAddress, area, city, hood })

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
  const citiesList = extractCities(currentArea ? [currentArea] : finalAreas).sort(
    byCount
  )

  let neighborhoods: any[] = []
  const targetForNeighborhoods = city || area
  if (targetForNeighborhoods) {
    const dynamicNeighborhoods = await APILocations.fetchAreaNeighborhoods(
      targetForNeighborhoods
    )
    neighborhoods = dynamicNeighborhoods.map((name) => ({
      name,
      activeCount: 0,
      location: { lat: 0, lng: 0 }
    }))
  }

  const hoods =
    neighborhoods.length
      ? neighborhoods
      : (city && currentLocation
        ? (currentLocation as ApiBoardCity).neighborhoods || []
        : (currentArea ? currentArea.cities : []))

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
