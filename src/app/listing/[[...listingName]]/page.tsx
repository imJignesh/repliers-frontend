import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import type React from 'react'

import content from '@configs/content'
import routes from '@configs/routes'
import { Property404Template, PropertyPageTemplate } from '@templates'

import { JsonLd } from 'components/atoms'
import { formatMetadata, formatShortAddress, withdrawn } from 'utils/properties'
import { getSeoUrl } from 'utils/properties/seo'
import {
  getBreadcrumbJsonLd,
  getListingJsonLd,
  getPropertyBreadcrumbItems
} from 'utils/structuredData'
import { getProtocolHost } from 'utils/urls'

import { type Params, type SearchParams } from './types'
import {
  fetchNearbies,
  fetchProperty,
  getCanonicalPath,
  parseParams
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
  const { listingId, boardId } = parseParams(params, searchParams)
  try {
    const property = await fetchProperty(listingId, boardId)
    return formatMetadata(property, host)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    return content.missingPropertyMetadata
  }
}

const PropertyPage = async (props: PropertyPageProps) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const host = getProtocolHost(await headers())
  const { listingId, boardId, listingName } = parseParams(params, searchParams)

  // The fetch is deliberately the ONLY thing inside the try. notFound() and
  // permanentRedirect() signal by throwing, so anything that calls them from
  // inside a try/catch gets silently swallowed and rendered as a 200 -- which
  // is the defect this route is being fixed for.
  let property
  let fetchError: any = null
  try {
    property = await fetchProperty(listingId, boardId)
  } catch (error: any) {
    fetchError = error
  }

  // ─── Rule A: absent record must be a real 404 ───────────────────────────────
  // Previously every failure rendered Property404Template, which is a normal
  // component -- Next.js returned HTTP 200 with 404 wording in the body, so
  // Google indexed thousands of these as soft 404s.
  if (!property) {
    const status = fetchError?.status ?? fetchError?.response?.status

    // 404/410/null/no-property => the record is gone. Anything else (notably
    // 403, an MLS-compliance gated listing that does exist, and 5xx transport
    // failures) keeps the explanatory page: those URLs must not be de-indexed.
    if (!fetchError || status === 404 || status === 410) {
      notFound()
    }

    const properties = await fetchNearbies(listingName)
    return (
      <Property404Template
        listingName={listingName}
        properties={properties}
        error={fetchError}
      />
    )
  }

  // ─── Rule A (cont.): withdrawn records are gone, not just unavailable ───────
  // An expired/terminated listing still comes back from the feed, so it used to
  // render a full listing page at HTTP 200 with robots "index, follow" — which
  // is what Google reports as a Soft 404. Sold listings are excluded on purpose:
  // sold history is real content here and stays indexable.
  if (withdrawn(property)) {
    notFound()
  }

  // ─── Rule C: one 301 from any alternate route to the clean canonical ────────
  const canonicalPath = getCanonicalPath(property, listingName)
  if (canonicalPath && canonicalPath !== `${routes.listing}/${listingName}`) {
    permanentRedirect(canonicalPath)
  }

  const url = host + getSeoUrl(property, { excludeQuery: true })
  const breadcrumbItems = getPropertyBreadcrumbItems(property.address, host, {
    name: formatShortAddress(property.address, true) || property.mlsNumber,
    url
  })

  return (
    <>
      <JsonLd data={getListingJsonLd(property, host)} />
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbItems)} />
      <PropertyPageTemplate property={property} />
    </>
  )
}

export default PropertyPage
