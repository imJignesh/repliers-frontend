'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Button, Stack } from '@mui/material'

import { navigationItems, propertyDialogContentId } from '../constants'

const getTopOffsetInContainer = (element: Element, container: HTMLElement) => {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return elementRect.top - containerRect.top + container.scrollTop
}

const NavigationItems = ({
  active,
  onChange,
  items = navigationItems
}: {
  active: number
  onChange: (index: number) => void
  items?: typeof navigationItems
}) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const [available, setAvailable] = useState<boolean[]>([])

  const scrollToElement = useCallback((element: Element) => {
    const container = containerRef.current
    const top = container
      ? getTopOffsetInContainer(element, container) - (52 + 32)
      : element.getBoundingClientRect().top + window.scrollY - (60 + 32)

      ; (container || window).scrollTo({
        behavior: 'smooth',
        top
      })
  }, [])

  const handleClick = (e: React.MouseEvent, index: number) => {
    const elementId = items[index].id
    const anchor = document.getElementById(elementId)
    if (anchor) {
      onChange(index)
      scrollToElement(anchor)
      e.preventDefault()
    }
  }

  useEffect(() => {
    // fill the elements array with the flags of availability (existence)
    setAvailable(
      items.map((item) => !!document.getElementById(item.id))
    )
    // set the scrollable container reference
    containerRef.current = document.getElementById(propertyDialogContentId)
  }, [items])

  return (
    <Stack spacing={2} direction="row" justifyContent="center">
      {items.map((item, index) =>
        available[index] ? (
          <Button
            key={index}
            href={`#${item.id}`}
            variant={active === index ? 'contained' : 'text'}
            onClick={(e: React.MouseEvent) => handleClick(e, index)}
            sx={{ height: '44px', whiteSpace: 'nowrap' }}
          >
            {item.label}
          </Button>
        ) : null
      )}
    </Stack>
  )
}

export default NavigationItems
