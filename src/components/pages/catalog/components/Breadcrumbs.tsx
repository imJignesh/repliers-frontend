import Link from 'next/link'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'
import routes from '@configs/routes'

import { sanitizeUrl } from 'utils/urls'

import { useSearch } from 'providers/SearchProvider/SearchProvider'

const Breadcrumbs = ({
  area,
  city,
  hood
}: {
  area?: string
  city?: string
  hood?: string
}) => {
  const { setLoading } = useSearch()
  const crumbs = [defaultLocation.state, area, city, hood].filter(
    (crumb) => crumb
  )

  if (crumbs.length === 1) return null

  const crumbsLinks = crumbs.map((crumb, index) => {
    // crumbs[0] is the state; the rest are positional location path segments
    // (area / city / hood). Build the cumulative URL up to this crumb.
    const segments = crumbs.slice(1, index + 1).map((c) => sanitizeUrl(c!))
    const url = `${routes.listings}${segments.length ? '/' + segments.join('/') : ''}`
    return (
      <Link key={crumb} href={url} onClick={() => setLoading(true)}>
        <Typography fontSize={14} fontWeight={500}>
          {crumb}
        </Typography>
      </Link>
    )
  })

  return (
    <Stack
      spacing={0.75}
      direction="row"
      alignItems="center"
      divider={<ChevronRightIcon sx={{ fontSize: 18 }} />}
    >
      {crumbsLinks}
    </Stack>
  )
}

export default Breadcrumbs
