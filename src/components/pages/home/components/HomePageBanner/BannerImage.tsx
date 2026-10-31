import React from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import content from '@configs/content'

const { siteName, siteSplashscreen } = content

/**
 * The banner photo is the Largest Contentful Paint element of the home page.
 * Lighthouse (audit RT08, October 2026) attributed 63% of a 22 s mobile LCP to
 * "load delay": the image was rendered with `loading="lazy"`, so the browser
 * only discovered it after hydration. `priority` emits a <link rel="preload">
 * in the server HTML and `fetchPriority="high"` ranks it above the script
 * downloads. `fill` + object-fit reproduce the previous legacy `layout="fill"`.
 */
const BannerImage = () => {
  return (
    <Box width="100%" height="100%" position="absolute" bgcolor="#000">
      <Image
        fill
        priority
        unoptimized
        fetchPriority="high"
        sizes="100vw"
        src={siteSplashscreen}
        alt={siteName}
        style={{ opacity: 0.8, objectFit: 'cover', objectPosition: 'center' }}
      />
    </Box>
  )
}

export default BannerImage
