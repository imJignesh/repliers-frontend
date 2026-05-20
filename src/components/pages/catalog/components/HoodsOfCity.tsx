import { Box, Container, Stack, Typography, Chip } from '@mui/material'
import Link from 'next/link'

import { type ApiNeighborhood } from 'services/API'
import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import { GroupTemplate } from '.'

type HoodWithNested = ApiNeighborhood & {
  neighborhoods?: ApiNeighborhood[]
}

const HoodsOfCity = ({
  hoods,
  city,
  isArea = false
}: {
  hoods: HoodWithNested[]
  city: string
  isArea?: boolean
}) => {
  if (!city || !hoods.length) return null

  const hasNested = isArea && hoods.some((h) => h.neighborhoods && h.neighborhoods.length > 0)

  // Area view with nested cities > neighborhoods
  if (hasNested) {
    return (
      <Container>
        <Stack spacing={4} pb={{ xs: 4, sm: 6 }}>
          <Typography variant="h2" sx={{ fontSize: '1.8rem', fontWeight: 700 }}>
            Cities of {city}
          </Typography>
          {hoods.map((cityHood) => (
            <Box key={cityHood.name}>
              {/* City heading links to city catalog page */}
              <Typography
                variant="h3"
                sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 1.5 }}
              >
                <Link
                  href={getCatalogUrl(cityHood.name)}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {capitalize(cityHood.name)}
                </Link>
              </Typography>

              {/* Neighborhoods under this city */}
              {cityHood.neighborhoods && cityHood.neighborhoods.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
                    gap: 0.75,
                    columnGap: 4,
                  }}
                >
                  {cityHood.neighborhoods.map((hood) => (
                    <Typography
                      key={hood.name}
                      variant="body2"
                      noWrap
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          '& a': { color: 'primary.main' }
                        }
                      }}
                    >
                      <Link
                        href={getCatalogUrl(cityHood.name, hood.name)}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                      >
                        {hood.name.replaceAll('/', ' / ')}
                      </Link>
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Container>
    )
  }

  // City view: flat neighborhoods list
  const items = hoods.filter(({ name }) => name !== city.toLowerCase())

  return (
    <GroupTemplate
      title={`${isArea ? 'Cities' : 'Neighborhoods'} of ${city}`}
      items={items.map(({ name, activeCount }) => ({
        name: capitalize(name),
        link: isArea ? getCatalogUrl(name) : getCatalogUrl(city, name),
        count: activeCount
      }))}
    />
  )
}

export default HoodsOfCity
