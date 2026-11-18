import routes from '@configs/routes'

/**
 * Audit 4 T09: building and neighbourhood pages had almost no crawlable
 * links (218 locations and 308 buildings were linked from nowhere). These
 * helpers turn the location tree and the building list into plain links
 * that location pages render in their server HTML.
 */

export type LocationTreeNode = {
  name: string
  slug: string
  listing_count?: number | string | null
  children?: LocationTreeNode[]
}

export type BuildingLinkRow = {
  name?: string | null
  slug?: string | null
  listing_count?: number | string | null
}

export type PlainLink = { name: string; href: string; count: number }

export type LinkGroup = { title: string; href?: string; links: PlainLink[] }

const count = (value: unknown) => Number(value) || 0

const nodeLink = (path: string[], node: LocationTreeNode): PlainLink => ({
  name: node.name,
  href: `${routes.listings}/${[...path, node.slug].join('/')}`,
  count: count(node.listing_count)
})

const bySlug = (nodes: LocationTreeNode[] | undefined, slug?: string) =>
  (nodes || []).find((node) => node.slug === slug)

/**
 * Link groups for a location page, from its area's tree.
 * - area page: each city with all its neighbourhoods
 * - city page: its neighbourhoods
 * - neighbourhood page: the other neighbourhoods of its city
 */
export const getLocationLinkGroups = (
  tree: LocationTreeNode | null | undefined,
  slugs: string[]
): LinkGroup[] => {
  if (!tree?.slug || !slugs.length || tree.slug !== slugs[0]) return []
  const areaPath = [tree.slug]

  if (slugs.length === 1) {
    return (tree.children || [])
      .map((city) => {
        const cityLink = nodeLink(areaPath, city)
        return {
          title: city.name,
          href: cityLink.href,
          links: (city.children || []).map((hood) =>
            nodeLink([...areaPath, city.slug], hood)
          )
        }
      })
      .filter((group) => group.links.length || group.href)
  }

  const city = bySlug(tree.children, slugs[1])
  if (!city) return []
  const cityPath = [...areaPath, city.slug]
  const hoods = (city.children || []).filter((hood) => hood.slug !== slugs[2])
  if (!hoods.length) return []

  return [
    {
      title:
        slugs.length === 2
          ? `Neighbourhoods in ${city.name}`
          : `Other neighbourhoods in ${city.name}`,
      href: slugs.length === 2 ? undefined : nodeLink(areaPath, city).href,
      links: hoods.map((hood) => nodeLink(cityPath, hood))
    }
  ]
}

export const getBuildingLinks = (
  rows: BuildingLinkRow[] | null | undefined
): PlainLink[] =>
  (rows || [])
    .filter((row) => row?.slug && row?.name)
    .map((row) => ({
      name: String(row.name),
      href: `${routes.building}/${row.slug}`,
      count: count(row.listing_count)
    }))
