'use client'

import Link from 'next/link'

import { Alert, Stack } from '@mui/material'

import routes from '@configs/routes'

import { type Property } from 'services/API'
import { formatDate, formatEnglishPrice } from 'utils/formatters'

/**
 * Audit R04: an older record of a relisted unit names the current listing,
 * so a saved link is not read as today's asking price.
 * Audit R03: says why a contradictory fact is not shown.
 */
const ListingNotices = ({ property }: { property: Property }) => {
  const newer = property.supersededBy
  const bedrooms = property.factWarnings?.bedrooms
  if (!newer?.mlsNumber && !bedrooms) return null

  return (
    <Stack spacing={1}>
      {newer?.mlsNumber && (
        <Alert severity="warning" role="status">
          This unit has been relisted. This older record is not the current
          asking price. Current listing:{' '}
          <Link
            href={`${routes.listing}/${newer.mlsNumber}`}
            style={{ fontWeight: 600, color: 'inherit' }}
          >
            {[
              newer.listPrice ? formatEnglishPrice(newer.listPrice) : null,
              newer.listDate ? `listed ${formatDate(newer.listDate)}` : null,
              `MLS ${newer.mlsNumber}`
            ]
              .filter(Boolean)
              .join(', ')}
          </Link>
          .
        </Alert>
      )}
      {bedrooms && (
        <Alert severity="info" role="status">
          {bedrooms}
        </Alert>
      )}
    </Stack>
  )
}

export default ListingNotices
