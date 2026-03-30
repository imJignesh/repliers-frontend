import React from 'react'

import { Box, Typography } from '@mui/material'

import { toRem } from 'utils/theme'

const OptionItem = ({
  badge,
  children,
  ...props
}: {
  badge?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLLIElement>) => (
  <li {...props}>
    <Box
      sx={{
        p: 1,
        py: 1.5,
        width: '100%',
        borderRadius: 2,
        fontSize: toRem(14),
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '& a': {
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            color: 'inherit',
            textDecoration: 'none'
          }
        }}
      >
        {children}
      </Box>
      {badge && (
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: toRem(10),
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            flexShrink: 0
          }}
        >
          {badge}
        </Box>
      )}
    </Box>
  </li>
)

export default OptionItem
