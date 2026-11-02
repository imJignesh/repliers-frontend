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
type ApiLocationLevel = { name?: string; slug?: string } | null | undefined
type ApiPropertyLocation =
  | {
      items?: ApiLocationItem[] | null
      area?: ApiLocationLevel
      city?: ApiLocationLevel
      locality?: ApiLocationLevel
      path?: string | null
    }
  | null
  | undefined

const LOCATIONS_PREFIX = '/locations/'

/**
 * Payloads from before the backend returned `items` still carry curated
 * area/city/locality slugs and the matching `path`. Use them only when the
 * slugs join to exactly that path, so nothing is inferred from text.
 */
const itemsFromLevels = (location: ApiPropertyLocation): ApiLocationItem[] => {
  if (!location?.path?.startsWith(LOCATIONS_PREFIX)) return []
  const levels = [location.area, location.city, location.locality].filter(
    (level): level is { name: string; slug: string } =>
      !!level?.name && !!level?.slug
  )
  const items = levels.map((level, i) => ({
    name: level.name,
    path:
      LOCATIONS_PREFIX +
      levels
        .slice(0, i + 1)
        .map((l) => l.slug)
        .join('/')
  }))
  return items.length && items[items.length - 1].path === location.path
    ? items
    : []
}

export const getLocationCrumbs = (
  location: ApiPropertyLocation
): LocationCrumb[] =>
  (location?.items?.length ? location.items : itemsFromLevels(location))
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
 * The chain for a building page: the building's own place wins, and the
 * sample listing's chain is used only when the building has none.
 */
export const getBuildingPageLocationCrumbs = (
  property: unknown
): LocationCrumb[] => {
  const p = (property || {}) as {
    location?: ApiPropertyLocation
    building?: { location?: ApiPropertyLocation } | null
  }
  const own = getLocationCrumbs(p.building?.location)
  return own.length ? own : getLocationCrumbs(p.location)
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
