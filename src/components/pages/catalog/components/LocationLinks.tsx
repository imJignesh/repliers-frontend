import Link from 'next/link'

import { Box, Container, Stack, Typography } from '@mui/material'

import { type LinkGroup, type PlainLink } from 'utils/locationLinks'

const linkGrid = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
    lg: 'repeat(4, minmax(0, 1fr))'
  },
  columnGap: 4,
  rowGap: 0.75,
  m: 0,
  p: 0,
  listStyle: 'none'
} as const

const LinkList = ({ links }: { links: PlainLink[] }) => (
  <Box component="ul" sx={linkGrid}>
    {links.map((link) => (
      <Typography component="li" variant="body2" key={link.href}>
        <Link href={link.href} style={{ color: 'inherit' }}>
          {link.name.replaceAll('/', ' / ')}
        </Link>
        {link.count > 0 && (
          <Box component="span" sx={{ color: 'text.secondary', ml: 0.75 }}>
            ({link.count})
          </Box>
        )}
      </Typography>
    ))}
  </Box>
)

/**
 * Audit 4 T09: server-rendered links to the neighbourhoods and buildings of
 * a location page, so crawlers can reach every one of them.
 */
const LocationLinks = ({
  groups,
  buildings,
  placeName
}: {
  groups: LinkGroup[]
  buildings: PlainLink[]
  placeName: string
}) => {
  if (!groups.length && !buildings.length) return null

  return (
    <Container component="nav" aria-label={`Explore ${placeName}`}>
      <Stack spacing={4} py={{ xs: 4, sm: 6 }}>
        {buildings.length > 0 && (
          <Box>
            <Typography component="h2" variant="h6" mb={1.5}>
              Condo buildings in {placeName}
            </Typography>
            <LinkList links={buildings} />
          </Box>
        )}
        {groups.map((group) => (
          <Box key={group.href || group.title}>
            <Typography component="h2" variant="h6" mb={1.5}>
              {group.href ? (
                <Link href={group.href} style={{ color: 'inherit' }}>
                  {group.title}
                </Link>
              ) : (
                group.title
              )}
            </Typography>
            <LinkList links={group.links} />
          </Box>
        ))}
      </Stack>
    </Container>
  )
}

export default LocationLinks
