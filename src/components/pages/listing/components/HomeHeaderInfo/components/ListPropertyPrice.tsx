import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import { ScrubbedPrice } from 'components/atoms'

import { type Property } from 'services/API'
import { formatEnglishPrice, toSafeNumber } from 'utils/formatters'
import { createPropertyI18nUtils } from 'utils/properties'

import PriceDifference from './PriceDifference'

const ListPropertyPrice = ({ property }: { property: Property }) => {
  const { listPrice, originalPrice } = property
  const t = useTranslations()
  const { getDaysSinceListed } = createPropertyI18nUtils(t)

  const days = getDaysSinceListed(property)
  const listPriceNumber = toSafeNumber(listPrice)
  const originalPriceNumber = toSafeNumber(originalPrice)

  const showOriginal =
    originalPriceNumber > 0 && listPriceNumber !== originalPriceNumber

  return (
    <Stack>
      <Stack
        spacing={1}
        direction="row"
        alignItems="flex-end"
        sx={{ maxHeight: 36 }}
      >
        <Typography noWrap variant="h2">
          <ScrubbedPrice value={listPrice} />
        </Typography>
        {showOriginal && (
          // Audit R06: name the struck-through figure so it is not read as a
          // second current asking price.
          <Typography variant="h4" component="span">
            <Typography
              component="span"
              variant="body2"
              color="text.hint"
              sx={{ mr: 0.5 }}
            >
              Original list price
            </Typography>
            <Typography
              component="span"
              variant="h4"
              sx={{ textDecoration: 'line-through' }}
            >
              {formatEnglishPrice(originalPrice)}
            </Typography>
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography color="text.hint">{days.label}</Typography>
        {showOriginal && (
          <PriceDifference
            before={originalPrice}
            after={listPrice}
            label="none"
          />
        )}
      </Stack>
    </Stack>
  )
}

export default ListPropertyPrice
