'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { Pagination, Skeleton, Stack } from '@mui/material'

import searchConfig from '@configs/search'

import { useSearch } from 'providers/SearchProvider/SearchProvider'
import useClientSide from 'hooks/useClientSide'

// NOTE: WE HAVE TO render <Pagination /> only on client side as it comes
// screwed up from the server (+ broken states)

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
  const router = useRouter()
  const { loading, setLoading } = useSearch()
  const clientSide = useClientSide()
  const pages = Math.ceil(count / pageSize)

  if (loading) return null

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    setLoading(true)
    // Preserve existing query params (e.g. type=building) when changing page
    const params = new URLSearchParams(window?.location.search)
    Object.entries(extraParams || {}).forEach(([k, v]) => params.set(k, v))
    params.set('page', String(value))
    router.push(`${window?.location.pathname}?${params.toString()}`)
  }

  return count > pageSize ? (
    clientSide ? (
      <Pagination
        size="small"
        page={page}
        count={pages}
        siblingCount={1}
        boundaryCount={1}
        onChange={handlePageChange}
      />
    ) : (
      <Stack spacing={2} direction="row" py={0.5}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="circular" sx={{ width: 20, height: 20 }} />
        ))}
      </Stack>
    )
  ) : null
}

export default CatalogPagination
