import { Stack, Typography } from '@mui/material'

import { ScrubbedDate } from 'components/atoms'

import { formatEnglishPrice } from 'utils/formatters'

const HistoryItemRow = ({
  date,
  label = '',
  price,
  blurred = false
}: {
  date: string
  label: string
  price?: number | string | null
  blurred?: boolean
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 0.5, sm: 1, md: 1 }}
      alignItems={{ sm: 'center' }}
    >
      <Typography
        color="text.hint"
        minWidth="100px"
        width="28%"
        sx={blurred ? { filter: 'blur(4px)', userSelect: 'none', opacity: 0.7 } : {}}
      >
        <ScrubbedDate value={date} />
      </Typography>
      <Typography fontWeight={500} minWidth="128px" width="35%">
        {label}
      </Typography>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        minWidth="90px"
        width="25%"
        sx={blurred ? { filter: 'blur(6px)', userSelect: 'none', opacity: 0.7 } : {}}
      >
        {Number(price) > 0 ? formatEnglishPrice(price) : ''}
      </Typography>
    </Stack>
  )
}

export default HistoryItemRow
