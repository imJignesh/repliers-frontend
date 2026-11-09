'use client'

import { usePathname, useSearchParams } from 'next/navigation'

import { keepCatalogFilters } from 'utils/catalogLinks'

/** Returns a function that adds the current catalog filters to a location link. */
const useKeepCatalogFilters = () => {
  const pathname = usePathname() || ''
  const searchParams = useSearchParams()
  const search = searchParams?.toString() || ''
  return (href: string | null | undefined) =>
    keepCatalogFilters(href, pathname, search)
}

export default useKeepCatalogFilters
