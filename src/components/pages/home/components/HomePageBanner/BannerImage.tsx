import React from 'react'

import { Box } from '@mui/material'

import content from '@configs/content'

const { siteName, siteSplashscreen, siteSplashscreenMobile } = content

// Phones up to this width get the cropped mobile photo. Keep in sync with the
// preload <link> tags in app/page.tsx so the browser fetches only one file.
export const BANNER_MOBILE_MEDIA = '(max-width: 600px)'
export const BANNER_DESKTOP_MEDIA = '(min-width: 601px)'

/**
 * The banner photo is the Largest Contentful Paint element of the home page
 * (audit RT08). On phones the banner is a tall portrait box, so with
 * object-fit: cover only the middle strip of the 1600x798 photo is ever
 * visible. A <picture> serves phones a pre-cropped copy of that strip
 * (60 KB instead of 160 KB), which looks the same and downloads faster
 * on slow mobile connections.
 *
 * The image is preloaded from app/page.tsx with matching media queries, and
 * fetchPriority="high" ranks it above the script downloads.
 */
const BannerImage = () => {
  return (
    <Box width="100%" height="100%" position="absolute" bgcolor="#000">
      <picture>
        <source media={BANNER_MOBILE_MEDIA} srcSet={siteSplashscreenMobile} />
        {/* eslint-disable-next-line @next/next/no-img-element -- art-directed <picture>; next/image can't do per-device files */}
        <img
          src={siteSplashscreen}
          alt={siteName}
          fetchPriority="high"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.8,
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </picture>
    </Box>
  )
}

export default BannerImage
