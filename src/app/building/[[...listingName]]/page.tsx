import { headers } from 'next/headers'
import type React from 'react'

import content from '@configs/content'
import { Property404Template, PropertyPageTemplate } from '@templates'

import { formatMetadata } from 'utils/properties'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './types'
import { fetchNearbies, fetchProperty, parseSlug, fetchBuilding, fetchBuildingHistory } from './utils'
import BuildingPageTemplate from 'components/templates/BuildingPageTemplate'

type PropertyPageProps = {
  params: Params
  searchParams: SearchParams
}

// NextJS SSR metadata generation
export const generateMetadata = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const host = getProtocolHost(await headers())
  const { boardId, streetName, streetNumber, slug, streetSuffix, streetDirection } = parseSlug(params, searchParams)
  try {
    const property = await fetchBuilding(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection)
    const p = property?.listings?.[0]
    if (!p) {
      if (property.building) {
        return {
          title: property.building.name,
          description: `View units and history for ${property.building.name} at ${property.building.address}`
        }
      }
      return content.missingPropertyMetadata
    }

    const metadata = formatMetadata(p, host)
    if (property.building?.name) {
      metadata.title = `${property.building.name} - ${metadata.title}`
    }

    return metadata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return content.missingPropertyMetadata
  }
}

const PropertyPage = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { boardId, streetName, streetNumber, slug, streetSuffix, streetDirection } = parseSlug(params, searchParams)
  const listingName = params.listingName?.[0] || ''

  try {
    const [property, history] = await Promise.all([
      fetchBuilding(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection),
      fetchBuildingHistory(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection)
    ])

    if (!property?.listings?.length && !property?.building) {
      throw { status: 404 }
    }
    return <BuildingPageTemplate property={property} history={history} />
  } catch (error: any) {
    // Attempt to fetch nearbies for the 404 page
    const properties = await fetchNearbies(listingName)
    return (
      <Property404Template
        listingName={listingName}
        properties={properties}
        error={error}
      />
    )
  }
}

export default PropertyPage
