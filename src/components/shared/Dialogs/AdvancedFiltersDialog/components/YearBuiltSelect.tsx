import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
  TextField
} from '@mui/material'

import SelectLabel from 'components/atoms/SelectLabel'

import { type Filters } from 'services/Search'

import { getYearBuiltError, parseYear, maxYear } from 'utils/yearBuilt'

const YearBuiltSelect = ({
  from,
  to,
  onChange,
  onError
}: {
  from?: number | null
  to?: number | null
  onChange: (filters: Filters) => void
  onError?: (error: string | null) => void
}) => {
  const [fromYear, setFromYear] = useState<string>(from ? String(from) : '')
  const [toYear, setToYear] = useState<string>(to ? String(to) : '')

  const error = getYearBuiltError(fromYear, toYear)

  useEffect(() => {
    onError?.(error)
  }, [error])

  const update = (nextFrom: string, nextTo: string) => {
    setFromYear(nextFrom)
    setToYear(nextTo)
    const minYearBuilt = parseYear(nextFrom) ?? undefined
    const maxYearBuilt = parseYear(nextTo) ?? undefined
    // Keep the search in step with what is on screen: an invalid bound is
    // removed rather than leaving the previous valid value applied.
    onChange({ minYearBuilt, maxYearBuilt })
  }

  const adornment = (value: string, clear: () => void, label: string) =>
    value ? (
      <IconButton sx={{ mr: -1 }} onClick={clear} aria-label={label}>
        <CloseIcon fontSize="small" />
      </IconButton>
    ) : null

  const inputProps = (label: string) => ({
    inputMode: 'numeric' as const,
    maxLength: 4,
    'aria-label': label,
    'aria-invalid': Boolean(error)
  })

  return (
    <Box>
      <SelectLabel>Year built</SelectLabel>
      <Stack direction="row" spacing={4}>
        <TextField
          sx={{ flex: 1 }}
          value={fromYear}
          placeholder="Any"
          error={Boolean(error)}
          onChange={(e) => update(e.target.value, toYear)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">From</InputAdornment>
              ),
              endAdornment: adornment(
                fromYear,
                () => update('', toYear),
                'Clear year built from'
              ),
              inputProps: inputProps('Year built from')
            }
          }}
        />

        <TextField
          sx={{ flex: 1 }}
          placeholder={maxYear.toString()}
          value={toYear}
          error={Boolean(error)}
          onChange={(e) => update(fromYear, e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">To</InputAdornment>
              ),
              endAdornment: adornment(
                toYear,
                () => update(fromYear, ''),
                'Clear year built to'
              ),
              inputProps: inputProps('Year built to')
            }
          }}
        />
      </Stack>
      {error && (
        <FormHelperText error role="alert">
          {error}
        </FormHelperText>
      )}
    </Box>
  )
}

export default YearBuiltSelect
