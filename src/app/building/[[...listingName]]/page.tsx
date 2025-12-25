import { headers } from 'next/headers'
import type React from 'react'

import content from '@configs/content'
import { Property404Template, PropertyPageTemplate } from '@templates'

import { formatMetadata } from 'utils/properties'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './types'
import { fetchNearbies, fetchProperty, parseSlug, fetchBuilding } from './utils'
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
  const { boardId, streetName, streetNumber } = parseSlug(params, searchParams)
  try {
    const property = await fetchBuilding(boardId, streetName, streetNumber)
    return formatMetadata(property, host)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return content.missingPropertyMetadata
  }
}

const PropertyPage = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const { boardId, streetName, streetNumber } = parseSlug(params, searchParams)
  try {
    const property = await fetchBuilding(boardId, streetName, streetNumber)
    // console.log(property?.listings[0])
    return <BuildingPageTemplate property={property} />
  } catch (error: any) {
    // const properties = await fetchNearbies(listingName)
    // return (
    //   <Property404Template
    //     listingName={listingName}
    //     properties={properties}
    //     error={error}
    //   />
    // )
  }
}

export default PropertyPage
