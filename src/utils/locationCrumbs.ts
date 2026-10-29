import routes from '@configs/routes'

/**
 * Location breadcrumbs from the API's curated location chain (audit RT03).
 *
 * The backend resolves each property through the location tree and returns
 * `location.items`, one entry per level with a path the location routes can
 * serve. Breadcrumbs are built only from those items; address text such as
 * "The Beaches, East End, Toronto" is never turned into a URL, because that
 * produced links like /locations/toronto/toronto/the-beaches-east-end-toronto.
 */

export type LocationCrumb = { name: string; url: string }

type ApiLocationItem = { name?: string; path?: string | null }
type ApiPropertyLocation =
  | { items?: ApiLocationItem[] | null }
  | null
  | undefined

const LOCATIONS_PREFIX = '/locations/'

export const getLocationCrumbs = (
  location: ApiPropertyLocation
): LocationCrumb[] =>
  (location?.items || [])
    .filter(
      (item): item is { name: string; path: string } =>
        !!item?.name &&
        typeof item.path === 'string' &&
        item.path.startsWith(LOCATIONS_PREFIX)
    )
    .map((item) => ({
      name: item.name,
      url: `${routes.listings}/${item.path.slice(LOCATIONS_PREFIX.length)}`
    }))

/**
 * The chain for a property page: the listing's own location first, then its
 * building's, whichever the API resolved further.
 */
export const getPropertyLocationCrumbs = (
  property: unknown
): LocationCrumb[] => {
  const p = (property || {}) as {
    location?: ApiPropertyLocation
    building?: { location?: ApiPropertyLocation } | null
  }
  const own = getLocationCrumbs(p.location)
  const fromBuilding = getLocationCrumbs(p.building?.location)
  return fromBuilding.length > own.length ? fromBuilding : own
}

/**
 * A building page link only exists for a published building; the API marks
 * the rest with `published: false`. Older payloads without the flag keep
 * their link.
 */
export const getBuildingHref = (
  building: { slug?: string | null; published?: boolean } | null | undefined
): string | null =>
  building?.slug && building.published !== false
    ? `${routes.building}/${building.slug}`
    : null
