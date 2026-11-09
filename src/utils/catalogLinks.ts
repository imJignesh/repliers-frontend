import { filter as isFilterSegment } from 'app/locations/[[...slugs]]/_parsers'

/**
 * Audit R01 (6 Nov 2026 retest): location chips, neighbourhood links and
 * breadcrumbs pointed at the bare location, so "2+ beds under $600K" on
 * Toronto became an unfiltered Scarborough search. Narrowing or moving the
 * location now carries the current filter facet and query along. Page number
 * is dropped because the new location has its own result pages.
 */
export const keepCatalogFilters = (
  href: string | null | undefined,
  pathname: string,
  search: string
): string | null => {
  if (!href) return href ?? null
  const [hrefPath, hrefQuery = ''] = href.split('?')

  const hrefLast = hrefPath.split('/').filter(Boolean).pop() || ''
  const currentLast = pathname.split('/').filter(Boolean).pop() || ''
  const facet =
    !isFilterSegment(hrefLast) && currentLast && isFilterSegment(currentLast)
      ? currentLast
      : ''

  const query = new URLSearchParams(search)
  new URLSearchParams(hrefQuery).forEach((v, k) => query.set(k, v))
  query.delete('page')
  const q = query.toString()

  return `${hrefPath.replace(/\/+$/, '')}${facet ? `/${facet}` : ''}${q ? `?${q}` : ''}`
}
