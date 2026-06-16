'use client'

import React from 'react'
import Link from 'next/link'

import { Box, Chip, Container, Stack, Typography } from '@mui/material'

import useResponsiveValue from 'hooks/useResponsiveValue'

const GroupTemplate = ({
  title,
  items,
  direction
}: {
  title: string
  items: {
    name: string | React.ReactNode
    link: string
    rel?: string
    count?: number
    distance?: number
  }[]
  direction?: 'row' | 'column'
}) => {
  const columns = useResponsiveValue({ xs: 1, sm: 2, md: 3, lg: 4 }) || 4
  const rowLength = Math.ceil(items.length / columns)

  if (!items.length) return null

  const columnData: typeof items[] = Array.from({ length: columns }, () => [])

  if (direction === 'column') {
    for (let i = 0; i < columns; i++) {
      columnData[i] = items.slice(i * rowLength, (i + 1) * rowLength)
    }
  } else {
    items.forEach((item, index) => {
      columnData[index % columns].push(item)
    })
  }

  const activeColumns = columnData.filter((col) => col.length > 0)

  return (
    <Container>
      <Stack width="100%" spacing={0} pb={{ xs: 4, sm: 6 }}>
        <Typography component="p" sx={{
          mb: 2
        }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: { xs: 2, sm: 4, md: 5 }
          }}
        >
          {activeColumns.map((columnItems, colIndex) => (
            <React.Fragment key={colIndex}>
              {colIndex > 0 && (
                <Box
                  sx={{
                    width: '1px',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    alignSelf: 'stretch',
                    display: { xs: 'none', sm: 'block' }
                  }}
                />
              )}
              <Stack
                spacing={1}
                sx={{
                  flex: 1,
                  minWidth: 0
                }}
              >
                {columnItems.map(({ name, link, rel, distance = 0, count = 0 }, index) => (
                  <Typography key={index} variant="body2" noWrap sx={{
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      '& a': { color: 'primary.main' }
                    }
                  }}>
                    <Link href={link} rel={rel} style={{ display: 'flex', alignItems: 'center', width: '100%', transition: 'color 0.2s', textDecoration: 'none', color: 'inherit' }}>
                      {typeof name === 'string' ? name.replaceAll('/', ' / ') : name}

                      {count > 0 && (
                        <Chip
                          label={count}
                          size="small"
                          sx={{
                            fontSize: 10,
                            ml: 1,
                            height: 18,
                            background: 'rgba(33, 150, 243, 0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}

                      {distance > 0 && (
                        <Box component="span" sx={{ color: '#999', fontSize: 11, ml: 0.5 }}>
                          {' '}
                          ({Number(distance).toFixed(distance <= 2 ? 1 : 0)}km)
                        </Box>
                      )}
                    </Link>
                  </Typography>
                ))}
              </Stack>
            </React.Fragment>
          ))}
        </Box>
      </Stack>
    </Container>
  )
}

export default GroupTemplate
