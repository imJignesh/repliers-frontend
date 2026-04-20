import { Box, Button, Typography } from '@mui/material'

const GalleryLockOverlay = () => {
  const handleScrollToForm = (e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById('contact-section')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.classList.remove('highlight-form')
      void element.offsetWidth // trigger reflow
      element.classList.add('highlight-form')
      setTimeout(() => {
        element.classList.remove('highlight-form')
      }, 1500)
    }
  }

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
      }}
    >
      <Button
        variant="contained"
        size="large"
        onClick={handleScrollToForm}
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
