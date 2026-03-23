import { headers } from 'next/headers'
import type React from 'react'

import content from '@configs/content'
import routes from '@configs/routes'
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
  const { boardId, streetName, streetNumber, slug, streetSuffix, streetDirection, buildingName: slugBuildingName } = parseSlug(params, searchParams)
  try {
    const property = await fetchBuilding(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection)
    const buildName = property.building?.name || slugBuildingName || ''
    const p = property?.listings?.[0]
    if (!p) {
      if (property?.building || slugBuildingName) {
        // mock property for metadata generator to still interpolate correctly
        const mockProperty = {
          details: { description: '' },
          images: [],
          address: {
            streetNumber: property?.building?.streetNumber || streetNumber,
            streetName: property?.building?.streetName || streetName,
            streetSuffix: property?.building?.streetSuffix || streetSuffix,
            city: property?.building?.city || '',
            neighborhood: property?.building?.neighborhood || ''
          }
        } as any

        const metadata: any = formatMetadata(mockProperty, host, { type: 'building', buildingName: buildName })
        metadata.alternates = {
          canonical: host + routes.building + '/' + slug
        }
        metadata.openGraph.url = host + routes.building + '/' + slug

        return metadata
      }
      return content.missingPropertyMetadata
    }

    const metadata: any = formatMetadata(p, host, { type: 'building', buildingName: buildName })

    metadata.alternates = {
      canonical: host + routes.building + '/' + slug
    }
    metadata.openGraph.url = host + routes.building + '/' + slug

    return metadata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    if (slugBuildingName) {
      const mockProperty = {
        details: { description: '' },
        images: [],
        address: {
          streetNumber: streetNumber,
          streetName: streetName,
          streetSuffix: streetSuffix,
          city: '',
          neighborhood: ''
        }
      } as any

      const metadata: any = formatMetadata(mockProperty, host, { type: 'building', buildingName: slugBuildingName })
      metadata.alternates = {
        canonical: host + routes.building + '/' + slug
      }
      metadata.openGraph.url = host + routes.building + '/' + slug
      return metadata
    }
    return content.missingPropertyMetadata
  }
}

const PropertyPage = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { boardId, streetName, streetNumber, slug, streetSuffix, streetDirection, buildingName: slugBuildingName } = parseSlug(params, searchParams)
  const listingName = params.listingName?.[0] || ''

  try {
    let [property, history] = await Promise.all([
      fetchBuilding(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection),
      fetchBuildingHistory(boardId, streetName, streetNumber, slug, streetSuffix, streetDirection)
    ])

    if (!property?.listings?.length && !property?.building) {
      if (slugBuildingName) {
        property = {
          listings: [],
          building: {
            name: slugBuildingName,
            streetNumber,
            streetName,
            streetSuffix,
            streetDirection,
            city: '',
            neighborhood: ''
          }
        } as any
      } else {
        throw { status: 404 }
      }
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
