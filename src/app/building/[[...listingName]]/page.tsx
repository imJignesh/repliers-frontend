import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import type React from 'react'

import content from '@configs/content'
import routes from '@configs/routes'
import { Property404Template } from '@templates'

import { JsonLd } from 'components/atoms'
import BuildingPageTemplate from 'components/templates/BuildingPageTemplate'

import { formatMetadata } from 'utils/properties'
import { deriveBuildingProperty } from 'utils/properties/building'
import {
  getBreadcrumbJsonLd,
  getBuildingJsonLd,
  getPropertyBreadcrumbItems
} from 'utils/structuredData'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './types'
import {
  fetchBuilding,
  fetchBuildingHistory,
  fetchNearbies,
  parseSlug
} from './utils'

type PropertyPageProps = {
  params: Params
  searchParams: SearchParams
}

// NextJS SSR metadata generation
export const generateMetadata = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const host = getProtocolHost(await headers())
  const {
    boardId,
    streetName,
    streetNumber,
    slug,
    streetSuffix,
    streetDirection,
    buildingName: slugBuildingName
  } = parseSlug(params, searchParams)
  try {
    const property = await fetchBuilding(
      boardId,
      streetName,
      streetNumber,
      slug,
      streetSuffix,
      streetDirection
    )

    if (!property?.building) {
      notFound()
    }

    const buildName = property.building.name || slugBuildingName || ''
    const canonicalSlug = property.building.slug || slug
    const p = property?.listings?.[0]
    if (!p) {
      // mock property for metadata generator to still interpolate correctly
      const mockProperty = {
        details: { description: '' },
        images: [],
        address: {
          streetNumber: property.building.streetNumber || streetNumber,
          streetName: property.building.streetName || streetName,
          streetSuffix: property.building.streetSuffix || streetSuffix,
          city: property.building.city || '',
          neighborhood: property.building.neighborhood || ''
        }
      } as any

      const metadata: any = formatMetadata(mockProperty, host, {
        type: 'building',
        buildingName: buildName
      })
      metadata.alternates = {
        canonical: host + routes.building + '/' + canonicalSlug
      }
      metadata.openGraph.url = host + routes.building + '/' + canonicalSlug

      return metadata
    }

    const metadata: any = formatMetadata(p, host, {
      type: 'building',
      buildingName: buildName
    })

    metadata.alternates = {
      canonical: host + routes.building + '/' + canonicalSlug
    }
    metadata.openGraph.url = host + routes.building + '/' + canonicalSlug

    return metadata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    if (
      error?.digest === 'NEXT_NOT_FOUND' ||
      error?.message === 'NEXT_NOT_FOUND'
    ) {
      throw error
    }
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

      const metadata: any = formatMetadata(mockProperty, host, {
        type: 'building',
        buildingName: slugBuildingName
      })
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
  const host = getProtocolHost(await headers())
  const {
    boardId,
    streetName,
    streetNumber,
    slug,
    streetSuffix,
    streetDirection,
    buildingName: slugBuildingName
  } = parseSlug(params, searchParams)
  const listingName = params.listingName?.[0] || ''

  let property
  let history
  try {
    ;[property, history] = await Promise.all([
      fetchBuilding(
        boardId,
        streetName,
        streetNumber,
        slug,
        streetSuffix,
        streetDirection
      ),
      fetchBuildingHistory(
        boardId,
        streetName,
        streetNumber,
        slug,
        streetSuffix,
        streetDirection
      )
    ])
  } catch (error: any) {
    // Same rule as /listing: a rendered 404 template is still an HTTP 200, so
    // an absent building has to go through notFound() to get a real status.
    // 403 (MLS-compliance gated) and 5xx keep the explanatory page — a
    // transient upstream failure must not de-index a live building.
    const status = error?.status ?? error?.response?.status
    if (status === 404 || status === 410) {
      notFound()
    }

    const properties = await fetchNearbies(listingName)
    return (
      <Property404Template
        listingName={listingName}
        properties={properties}
        error={error}
      />
    )
  }

  if (!property?.building) {
    notFound()
  }

  const canonicalSlug = property.building.slug
  if (canonicalSlug && listingName !== canonicalSlug) {
    permanentRedirect(routes.building + '/' + canonicalSlug)
  }

  const buildName = property.building.name || slugBuildingName || ''
  const derivedProperty = deriveBuildingProperty(property)
  const buildingJsonLd = canonicalSlug
    ? getBuildingJsonLd(property, host, buildName, canonicalSlug)
    : null
  const breadcrumbItems = derivedProperty
    ? getPropertyBreadcrumbItems(derivedProperty.address, host, {
        name: buildName,
        url: `${host}${routes.building}/${canonicalSlug}`
      })
    : null

  return (
    <>
      <JsonLd data={buildingJsonLd} />
      {breadcrumbItems && (
        <JsonLd data={getBreadcrumbJsonLd(breadcrumbItems)} />
      )}
      <BuildingPageTemplate property={property} history={history} />
    </>
  )
}

export default PropertyPage
