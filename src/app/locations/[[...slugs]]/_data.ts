import { cache } from 'react'

import { APILocations } from 'services/API'

// React cache shares reads between metadata and page rendering within one
// server request. It does not retain inventory or user data across requests.
export const fetchCatalogAreas = cache(() => APILocations.fetchAreas())

const validate = cache((key: string) =>
  APILocations.validateSlugs(JSON.parse(key))
)
export const validateCatalogSlugs = (slugs: string[]) =>
  validate(JSON.stringify(slugs))
