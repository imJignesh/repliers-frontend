import CloseIcon from '@mui/icons-material/Close'
import {
  IconButton,
  InputAdornment,
  type InputBaseComponentProps,
  Stack,
  TextField
} from '@mui/material'

import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'

const PriceSelect = ({
  min,
  max,
  onChange
}: {
  min?: number | null
  max?: number | null
  onChange: (filters: Filters) => void
}) => {
  const digits = (value: string) =>
    toSafeNumber(String(value).replace(/\D/g, ''))

  const handleMinChange = (e: any) =>
    onChange({ minPrice: digits(e.target.value) })
  const handleMaxChange = (e: any) =>
    onChange({ maxPrice: digits(e.target.value) })

  const clearMin = () => onChange({ minPrice: 0 })
  const clearMax = () => onChange({ maxPrice: 0 })

  // Audit R01: a reversed range must explain itself instead of quietly
  // producing an empty or unfiltered result.
  const reversed = Boolean(min && max && min > max)

  const inputProps = (label: string): InputBaseComponentProps => ({
    inputMode: 'numeric',
    maxLength: 9,
    'aria-label': label
  })

  return (
    <Stack direction="row" spacing={4}>
      <TextField
        sx={{ flex: 1 }}
        placeholder="Any"
        value={!min ? '' : min}
        onChange={handleMinChange}
        error={reversed}
        helperText={reversed ? 'Minimum is above maximum' : undefined}
        slotProps={{
          input: {
            inputProps: inputProps('Minimum price in dollars'),
            startAdornment: (
              <InputAdornment position="start">Min $</InputAdornment>
            ),
            endAdornment: min ? (
              <IconButton
                sx={{ mr: -1 }}
                onClick={clearMin}
                aria-label="Clear minimum price"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        }}
      />
      <TextField
        sx={{ flex: 1 }}
        placeholder="Any"
        value={!max ? '' : max}
        onChange={handleMaxChange}
        error={reversed}
        slotProps={{
          input: {
            inputProps: inputProps('Maximum price in dollars'),
            startAdornment: (
              <InputAdornment position="start">Max $</InputAdornment>
            ),
            endAdornment: max ? (
              <IconButton
                sx={{ mr: -1 }}
                onClick={clearMax}
                aria-label="Clear maximum price"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        }}
      />
    </Stack>
  )
}

export default PriceSelect
