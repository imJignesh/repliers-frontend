import {
  type BuildingLinkRow,
  getBuildingLinks,
  getLocationLinkGroups,
  type LinkGroup,
  type LocationTreeNode,
  type PlainLink
} from 'utils/locationLinks'

const apiBase = () =>
  (process.env.NEXT_PUBLIC_PRECONDO_URL || 'https://app.precondo.ca').replace(
    /\/$/,
    ''
  )

const getJson = async (url: string) => {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Audit 4 T09: plain links for the server HTML of a location page — its
 * child (or sibling) neighbourhoods and, on a neighbourhood page, every
 * building in it. Failures return no links rather than breaking the page.
 */
export const fetchLocationLinks = async (
  slugs: string[]
): Promise<{ groups: LinkGroup[]; buildings: PlainLink[] }> => {
  if (!slugs.length) return { groups: [], buildings: [] }
  const [areaSlug, , hoodSlug] = slugs

  const [tree, buildings] = await Promise.all([
    getJson(`${apiBase()}/api/locations/area/${encodeURIComponent(areaSlug)}`),
    hoodSlug
      ? getJson(
          `${apiBase()}/api/buildings/area/${encodeURIComponent(areaSlug)}/locality/${encodeURIComponent(hoodSlug)}?links=1`
        )
      : Promise.resolve(null)
  ])

  return {
    groups: getLocationLinkGroups(
      (tree?.data ?? null) as LocationTreeNode | null,
      slugs
    ),
    buildings: getBuildingLinks(
      (buildings?.data ?? null) as BuildingLinkRow[] | null
    )
  }
}
