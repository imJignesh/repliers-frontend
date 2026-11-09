import Link from 'next/link'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'

import { useSearch } from 'providers/SearchProvider/SearchProvider'
import { getCatalogHeaderCrumbs } from 'utils/locationCrumbs'
import useKeepCatalogFilters from 'hooks/useKeepCatalogFilters'

const Breadcrumbs = ({
  area,
  city,
  hood,
  locationSlugs
}: {
  area?: string
  city?: string
  hood?: string
  locationSlugs?: string[]
}) => {
  const { setLoading } = useSearch()
  // Audit R01: breadcrumbs keep the visitor's current filters.
  const keepFilters = useKeepCatalogFilters()
  const crumbs = getCatalogHeaderCrumbs({
    state: defaultLocation.state,
    names: [area, city, hood],
    locationSlugs
  })

  if (crumbs.length === 1) return null

  return (
    <Stack
      spacing={0.75}
      direction="row"
      alignItems="center"
      divider={<ChevronRightIcon sx={{ fontSize: 18 }} />}
    >
      {crumbs.map((crumb) => (
        <Link key={crumb.url} href={keepFilters(crumb.url) as string} onClick={() => setLoading(true)}>
          <Typography fontSize={14} fontWeight={500}>
            {crumb.name}
          </Typography>
        </Link>
      ))}
    </Stack>
  )
}

export default Breadcrumbs
