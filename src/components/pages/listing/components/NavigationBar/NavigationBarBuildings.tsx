'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Box, Container, Stack } from '@mui/material'

import { useProperty } from 'providers/PropertyProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import { toSafeNumber } from 'utils/formatters'

import {
    NavigationItems,
    SkeletonItems
} from './components'
import {
    embeddedBarOffset,
    propertyDialogContentId,
    staticBarOffset
} from './constants'
import { throttle } from './utils'

const visibilityThreshold = 0.5

const observerThresholds = [
    0,
    0.25,
    visibilityThreshold,
    0.75,
    1.0
]

const buildingNavigationItems = [
    { label: 'Features', id: 'features' },
    { label: 'Active Listings', id: 'active-listings' },
    { label: 'History', id: 'history' }
]

const NavigationBarBuildings = ({ embedded = false }: { embedded?: boolean }) => {
    const { property } = useProperty()
    const { raw, rooms } = property

    const propertyDetailsAvailable = Boolean(raw) || Boolean(rooms)

    const clientSide = useClientSide()
    const { desktop } = useBreakpoints()
    const [activeIndex, setActiveIndex] = useState(-1)
    const [scrollTop, setScrollTop] = useState(0)

    const containerRef = useRef<HTMLElement | Window | null>(null)
    const observersRef = useRef<IntersectionObserver[]>([])
    const thresholds = useRef(buildingNavigationItems.map(() => 0))

    const barOffset = embedded ? embeddedBarOffset : staticBarOffset

    const handleChange = (index: number) => {
        setTimeout(() => setActiveIndex(index), Math.abs(index - activeIndex) * 300)
    }

    const scrollHandler = throttle((e: React.UIEvent) => {
        const scrollTop = (e.target as HTMLDivElement).scrollTop || window.scrollY
        setScrollTop(scrollTop)
    }, 200)

    const updateActiveItem = () => {
        const arr = thresholds.current
        const maxIndex = arr.reduce((max, value, index) => {
            return value >= visibilityThreshold * 100 &&
                value > toSafeNumber(arr[max])
                ? index
                : max
        }, -1)

        setActiveIndex((prevIndex) =>
            maxIndex !== prevIndex ? maxIndex : prevIndex
        )
    }

    const createObservers = useCallback(() => {
        buildingNavigationItems.forEach(({ id }, index) => {
            const element = document.getElementById(id)
            if (element) {
                const observer = new IntersectionObserver(
                    (entries: IntersectionObserverEntry[]) => {
                        entries.forEach((entry) => {
                            const visiblePercentage = Math.round(
                                entry.intersectionRatio * 100
                            )

                            thresholds.current[index] = visiblePercentage
                            updateActiveItem()
                        })
                    },
                    {
                        root: containerRef.current,
                        threshold: observerThresholds
                    } as IntersectionObserverInit
                )

                observer.observe(element)
                observersRef.current.push(observer)
            }
        })
    }, [])

    const disconnectObservers = useCallback(() => {
        observersRef.current.forEach((observer) => observer.disconnect())
        observersRef.current = []
    }, [])

    useEffect(() => {
        if (!clientSide || !desktop || !propertyDetailsAvailable) return

        createObservers()
        const container = document.getElementById(propertyDialogContentId) || window
        container.addEventListener('scroll', scrollHandler)
        containerRef.current = container

        return () => {
            disconnectObservers()
            containerRef.current?.removeEventListener('scroll', scrollHandler)
        }
    }, [clientSide, propertyDetailsAvailable])

    return (
        <Box
            sx={{
                py: 1,
                px: 4,
                my: -1,
                mx: -4,
                zIndex: 'drawer',
                bgcolor: 'common.white',
                top: embedded ? '-8px' : 0,
                display: { xs: 'none', md: 'block' },
                position: { xs: 'relative', md: 'sticky' },
                transition: 'box-shadow 0.15s ease-in',
                ...(scrollTop > barOffset ? { boxShadow: 1 } : {})
            }}
        >
            <Box
                sx={{
                    top: -8,
                    left: 0,
                    right: 0,
                    height: 16,
                    position: 'absolute',
                    bgcolor: 'background.paper'
                }}
            />
            <Container sx={{ position: 'relative', minHeight: 44 }}>
                <Stack
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justifyContent="center" // Centered items since no left/right buttons
                    width="100%"
                >
                    {desktop &&
                        (propertyDetailsAvailable ? (
                            <NavigationItems
                                active={activeIndex}
                                onChange={handleChange}
                                items={buildingNavigationItems} // Pass items prop if supported, otherwise I need to modify NavigationItems
                            />
                        ) : (
                            <SkeletonItems />
                        ))}
                </Stack>
            </Container>
        </Box>
    )
}

export default NavigationBarBuildings
