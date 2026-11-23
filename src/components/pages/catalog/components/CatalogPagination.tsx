'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { Pagination, PaginationItem } from '@mui/material'

import searchConfig from '@configs/search'

import { useSearch } from 'providers/SearchProvider/SearchProvider'

/**
 * Href for a catalog page: keeps the current query (filters, sort), applies
 * extraParams (e.g. type=building) and drops `page` for page 1 so it matches
 * the canonical URL.
 */
export const getPageHref = (
  pathname: string,
  search: string,
  page: number,
  extraParams?: Record<string, string>
) => {
  const params = new URLSearchParams(search)
  Object.entries(extraParams || {}).forEach(([k, v]) => params.set(k, v))
  if (page > 1) params.set('page', String(page))
  else params.delete('page')
  const qs = params.toString()
  return `${pathname}${qs ? `?${qs}` : ''}`
}

// Technical audit TA04 (23 Nov 2026): page numbers were client-only
// <button>s, so the server HTML had no link to page 2+ and crawlers could not
// reach older listings. Each page is now an <a href> rendered on the server;
// clicks still navigate client-side through next/link.
const CatalogPagination = ({
  page,
  count,
  pageSize = searchConfig.pageSize,
  extraParams
}: {
  page: number
  count: number
  pageSize?: number
  extraParams?: Record<string, string>
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { loading, setLoading } = useSearch()
  const pages = Math.ceil(count / pageSize)

  if (loading || count <= pageSize) return null

  const search = searchParams?.toString() || ''

  return (
    <Pagination
      size="small"
      page={page}
      count={pages}
      siblingCount={1}
      boundaryCount={1}
      renderItem={(item) =>
        item.page && item.type !== 'start-ellipsis' && item.type !== 'end-ellipsis' ? (
          <PaginationItem
            {...item}
            component={Link}
            href={getPageHref(pathname, search, item.page, extraParams)}
            onClick={(event: React.MouseEvent) => {
              if (item.disabled || item.selected) {
                event.preventDefault()
                return
              }
              if (event.metaKey || event.ctrlKey || event.shiftKey) return
              setLoading(true)
            }}
          />
        ) : (
          <PaginationItem {...item} />
        )
      }
    />
  )
}

export default CatalogPagination
