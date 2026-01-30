import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'

import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Button, Stack, Typography } from '@mui/material'

import { ScrubbedDate, ScrubbedText } from 'components/atoms'

import {
  type ListingLastStatus,
  listingLastStatusMapping,
  type Property
} from 'services/API'
import { useProperty } from 'providers/PropertyProvider'
import { scrubbed, sold } from 'utils/properties'
import { createPropertyI18nUtils } from 'utils/properties'

const getLastStatus = (property: Property) => {
  return listingLastStatusMapping[property.lastStatus as ListingLastStatus]
}

const HistoryItemHeader = ({
  link,
  active,
  endDate,
  startDate,
  office
}: {
  link: string
  active: boolean
  endDate: string
  startDate: string
  office?: { brokerageName?: string }
}) => {
  const { property } = useProperty()
  const t = useTranslations()
  const { getDaysSinceListed } = createPropertyI18nUtils(t)

  const soldProperty = sold(property)
  const soldActive = soldProperty && active
  const scrubbedDate = scrubbed(startDate) || scrubbed(endDate)
  const { brokerageName } = office || {}

  const listingStatus = soldActive
    ? getLastStatus(property)
    : null

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="flex-end"
      justifyContent="space-between"
    >
      {/* <Stack spacing={1}>
        <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              color: { xs: active ? 'secondary.main' : '', md: 'common.black' }
            }}
          >
            {listingStatus || <ScrubbedDate value={startDate} />}
          </Typography>

        </Stack>

      </Stack> */}

    </Stack>
  )
}

export default HistoryItemHeader
