import { SxProps, Theme } from '@mui/material'
import { Box, Button, Typography } from '@mui/material'

import { useScrollToContact } from 'hooks/useScrollToContact'

const GalleryLockOverlay = ({ sx }: { sx?: SxProps<Theme> }) => {
  const scrollToContact = useScrollToContact()

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)',
        ...sx
      }}
    >
      <Button
        variant="contained"
        size="large"
        onClick={scrollToContact}
        sx={{
          py: 1.5,
          px: 4,
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 2,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          textTransform: 'none',
          transition: 'transform 0.2s',
          maxWidth: 400,
          width: '90%',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            color: 'white'
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'inherit' }}>
            Unlock all Photos and Listings Sitewide
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 400, 
              opacity: 0.9,
              fontSize: '0.75rem',
              mt: 0.5,
              color: 'inherit'
            }}
          >
            TRREB Requirement to View MLS Listings
          </Typography>
        </Box>
      </Button>
    </Box>
  )
}

export default GalleryLockOverlay
