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
  // Technical audit TA13: the blurred placeholder used opacity 0.7, which made
  // the text 2.75:1 against the panel (WCAG 1.4.3 needs 4.5:1). The blur alone
  // hides it; aria-hidden keeps screen readers from reading obscured values.
  const blurSx = (px: number) =>
    blurred ? { filter: `blur(${px}px)`, userSelect: 'none' as const } : {}

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
        sx={blurSx(4)}
        aria-hidden={blurred || undefined}
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
        sx={blurSx(6)}
        aria-hidden={blurred || undefined}
      >
        {Number(price) > 0 ? formatEnglishPrice(price) : ''}
      </Typography>
    </Stack>
  )
}

export default HistoryItemRow
