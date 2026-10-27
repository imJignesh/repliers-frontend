import React from 'react'

import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Box, IconButton } from '@mui/material'

const GalleryControls = ({
  variant = 'default',
  size = 40,
  show = true,
  onNext,
  onPrev,
  prevLabel = 'Previous photo',
  nextLabel = 'Next photo'
}: {
  variant?: 'default' | 'dark'
  size?: number
  show?: boolean
  onNext: () => void
  onPrev: () => void
  // Accessible names: the arrows are icon-only buttons (audit RT06)
  prevLabel?: string
  nextLabel?: string
}) => {
  const buttonSx = {
    top: '50%',
    width: size,
    height: size,
    position: 'absolute',
    opacity: show ? 1 : 0,
    pointerEvents: show ? 'auto' : 'none',
    transform: 'translate3d(0, -50%, 0)',
    transition: 'opacity 0.2s linear, background 0.2s linear',
    // keyboard users cannot hover: reveal the arrow when it receives focus
    '&:focus-visible': { opacity: 1, pointerEvents: 'auto' },
    // color variants
    ...(variant === 'default'
      ? {
          color: 'primary.dark',
          bgcolor: '#FFF9',
          '&:hover': { bgcolor: '#FFFC' }
        }
      : {
          color: 'common.white'
        })
  }

  const handlePrevClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onPrev()
  }

  const handleNextClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onNext()
  }

  return (
    <Box>
      <IconButton
        size="small"
        aria-label={prevLabel}
        sx={{
          left: 16,
          ...buttonSx
        }}
        onClick={handlePrevClick}
        onTouchEnd={handlePrevClick}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <IconButton
        size="small"
        aria-label={nextLabel}
        sx={{
          right: 16,
          ...buttonSx
        }}
        onClick={handleNextClick}
        onTouchEnd={handleNextClick}
      >
        <NavigateNextIcon />
      </IconButton>
    </Box>
  )
}

export default GalleryControls
