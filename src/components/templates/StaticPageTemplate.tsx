import React from 'react'
import Link from 'next/link'
import { Box, Container, Breadcrumbs, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import HeaderBanner from './components/HeaderBanner'
import { PageTemplate } from '.'

export type BreadcrumbItem = {
  label: string
  link?: string
}

const StaticPageTemplate = ({
  title = '',
  breadcrumbs,
  children
}: {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
}) => {
  return (
    <PageTemplate>
      <HeaderBanner>{title}</HeaderBanner>
      <Box bgcolor="background.default" >
        <Container
          sx={{
            py: { xs: 4, sm: 6, md: 8 },
            '& h3': { py: { xs: 4, sm: 6, md: 8 }, pb: { xs: 2, sm: 4 } }
          }}
        >
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Box mb={4} mt={-2}>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
                sx={{
                  fontSize: 13.5,
                  '& .MuiBreadcrumbs-separator': { mx: 0.5 }
                }}
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1
                  return isLast || !crumb.link ? (
                    <Typography
                      key={idx}
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: 13.5, fontWeight: 500 }}
                    >
                      {crumb.label}
                    </Typography>
                  ) : (
                    <Link
                      key={idx}
                      href={crumb.link}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontSize: 13.5,
                        fontWeight: 400,
                        transition: 'color 0.2s'
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {crumb.label}
                      </Box>
                    </Link>
                  )
                })}
              </Breadcrumbs>
            </Box>
          )}
          {children}
        </Container>
      </Box>
    </PageTemplate>
  )
}

export default StaticPageTemplate
