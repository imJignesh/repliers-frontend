import { Stack, Typography } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'

import IcoBath from '@icons/IcoBath'
import IcoBed from '@icons/IcoBed'
import IcoSquare from '@icons/IcoSquare'

import { type Property } from 'services/API'
import {
  getBathrooms,
  getBedrooms,
  getLotSize,
  getSqft,
  land,
  toSafeNumber
} from 'utils/properties'

const BasicPropertyIcons = ({ property }: { property: Property }) => {
  const { details } = property

  const sqft = getSqft(property)
  const beds = getBedrooms(details)
  const baths = getBathrooms(details)
  const lotSize = getLotSize(property)
  const parking = toSafeNumber(details?.numParkingSpaces)

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      spacing={{ xs: 2, sm: 2, md: 2, lg: 4 }}
      sx={{ pt: { xs: 1, sm: 0 } }}
    >
      {Boolean(beds.count) && (
        <Stack spacing={1} direction="row" alignItems="center">
          <IcoBed size={40} />
          <Typography variant="body1" color="text.hint">
            {beds.label}
          </Typography>
        </Stack>
      )}
      {Boolean(baths.count) && (
        <Stack spacing={1} direction="row" alignItems="center">
          <IcoBath size={38} />
          <Typography variant="body1" color="text.hint">
            {baths.label}
          </Typography>
        </Stack>
      )}
      {Boolean(parking > 0) && (
        <Stack spacing={1} direction="row" alignItems="center">
          <DirectionsCarIcon sx={{ fontSize: 38, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.hint">
            {parking}
          </Typography>
        </Stack>
      )}
      {Boolean(sqft.number) && (
        <Stack spacing={1} direction="row" alignItems="center">
          <IcoSquare size={32} />
          <Typography variant="body1" color="text.hint" noWrap>
            {sqft.label}
          </Typography>
        </Stack>
      )}
      {Boolean(lotSize.number && land(property)) && (
        <Stack spacing={1} direction="row" alignItems="center">
          <IcoSquare size={32} />
          <Typography variant="body1" color="text.hint" noWrap>
            {lotSize.label}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}

export default BasicPropertyIcons
