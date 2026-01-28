import { useState } from 'react'
import { Stack, Typography, Box, Button, Divider } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import propsConfig from '@configs/properties'

import { ScrubbedText } from 'components/atoms'

import { useProperty } from 'providers/PropertyProvider'
import { formatMultiLineText, scrubbed } from 'utils/properties'

const HomeDescription = () => {
  const {
    property: {
      details: { description }
    }
  } = useProperty()
  const [expanded, setExpanded] = useState(false)

  // WARN: multiline formatter returns non-empty string for any type of input
  const formattedDescription = formatMultiLineText(description || '')

  return (
    <Stack spacing={3} id="description" sx={{ mt: '-33px', pt: 4 }}>
      <Typography variant="h2">Description</Typography>
      <Box sx={{ position: 'relative' }}>
        <Typography
          component="div"
          sx={{
            my: -2,
            overflow: 'hidden',
            color: 'text.secondary',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'none' : 3,
            WebkitBoxOrient: 'vertical',
            transition: 'max-height 0.3s ease-in-out'
          }}
        >
          {scrubbed(description) ? (
            <p>
              <ScrubbedText replace={propsConfig.scrubbedDescriptionLabel} />
            </p>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: formattedDescription
              }}
            />
          )}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Divider sx={{ width: '100%', position: 'absolute' }} />
          <Button
            variant="outlined"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            sx={{
              position: 'relative',
              bgcolor: 'background.paper',
              borderColor: 'divider',
              borderRadius: '20px',
              color: 'text.primary',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                bgcolor: 'background.default',
                borderColor: 'primary.main'
              }
            }}
          >
            {expanded ? 'Read Less' : 'Read More'}
          </Button>
        </Box>
      </Box>
    </Stack>
  )
}

export default HomeDescription
