'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import { Box, Skeleton } from '@mui/material'

import type { LocationStatsParams } from '@shared/Stats/types'

const StatsWidgets = dynamic(() =>
  import('@shared/Stats/StatsWidgets').then((module) => module.StatsWidgets)
)

const DeferredStats = (props: Omit<LocationStatsParams, 'propertyClass'>) => {
  const container = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Box ref={container} sx={{ minHeight: 400 }}>
      {visible ? (
        <StatsWidgets {...props} />
      ) : (
        <Skeleton
          variant="rounded"
          height={400}
          aria-label="Market statistics loading"
        />
      )}
    </Box>
  )
}

export default DeferredStats
