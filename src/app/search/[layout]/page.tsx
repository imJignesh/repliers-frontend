import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { features } from 'features'
import { type Position } from 'geojson'

import { Page404Template, PageTemplate } from '@templates'
import routes from '@configs/routes'
import { getProtocolHost } from 'utils/urls'
import MapPageContent from '@pages/search'

import { APISaveSearch } from 'services/API'
import { type Filters } from 'services/Search'
import AiSearchProvider from 'providers/AiSearchProvider'
import MapOptionsProvider from 'providers/MapOptionsProvider'
import SearchProvider from 'providers/SearchProvider'

import { type Params, type SearchParams } from './_types'
import { getMapSearchHeading } from './_pageTitle'
import {
  getFiltersFromParams,
  getFiltersFromSavedSearch,
  getPositionFromPolygon
} from './_utils'

export const generateMetadata = async ({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> => {
  const { q } = await searchParams
  const heading = getMapSearchHeading(q)
  const canonical = getProtocolHost(await headers()) + routes.map
  return {
    title: `${heading} | Precondo`,
    description: q?.trim()
      ? `Explore property listings matching ${q.trim().replace(/\s+/g, ' ').slice(0, 80)} on the Precondo map.`
      : 'Explore property listings and neighbourhoods on the Precondo map.',
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: { url: canonical }
  }
}

const MapPage = async (props: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { style, layout } = params
  const { searchId, aiImage, aiFeature, q } = searchParams

  let title: string | undefined
  let position: any | undefined
  let filters: Filters | undefined
  let polygon: Position[] | undefined

  if (searchId) {
    const savedSearch = await APISaveSearch.fetch(searchId)
    const { name, map } = savedSearch
    polygon = map[0]

    title = name // use saved search name as map title (show special header)
    filters = getFiltersFromSavedSearch(savedSearch)
    position = getPositionFromPolygon(polygon)
  } else {
    filters = getFiltersFromParams(searchParams)
  }

  if (!features.map) return <Page404Template />

  return (
    <PageTemplate noFooter>
      <MapOptionsProvider
        title={title}
        position={position}
        layout={layout}
        style={style}
      >
        <SearchProvider filters={filters} polygon={polygon}>
          <AiSearchProvider image={aiImage} feature={aiFeature}>
            <MapPageContent heading={getMapSearchHeading(q)} />
          </AiSearchProvider>
        </SearchProvider>
      </MapOptionsProvider>
    </PageTemplate>
  )
}

export default MapPage
