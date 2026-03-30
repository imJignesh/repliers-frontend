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
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          textAlign: 'center',
          borderRadius: 4,
          maxWidth: 400,
          width: '90%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            mb: 3,
            lineHeight: 1.3,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
          }}
        >
          UNLOCK ALL CONDO LISTINGS AND INVENTORY SITEWIDE
        </Typography>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleScrollToForm}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 2,
            boxShadow: '0 10px 20px -10px rgba(var(--mui-palette-primary-mainChannel), 0.5)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          REGISTER TO VIEW PHOTOS
        </Button>
      </Box>
    </Box>
  )
}

export default GalleryLockOverlay
