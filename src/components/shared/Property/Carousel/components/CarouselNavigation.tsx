import type React from 'react'

import { Button, Stack } from '@mui/material'

import IcoNext from '@icons/IcoNext'
import IcoPrev from '@icons/IcoPrev'

const CarouselNavButton = ({
  direction,
  title,
  onClick
}: {
  direction: 'prev' | 'next'
  title: string
  onClick: () => void
}) => {
  return (
    <Button variant="contained" aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} ${title}`} onClick={onClick}>
      {direction === 'prev' ? <IcoPrev /> : <IcoNext />}
    </Button>
  )
}

const CarouselNavigation = ({
  title,
  onPrev,
  onNext
}: {
  title: string
  onPrev: () => void
  onNext: () => void
}) => {
  return (
    <Stack spacing={2} direction="row">
      <CarouselNavButton direction="prev" title={title} onClick={onPrev} />
      <CarouselNavButton direction="next" title={title} onClick={onNext} />
    </Stack>
  )
}

export default CarouselNavigation
