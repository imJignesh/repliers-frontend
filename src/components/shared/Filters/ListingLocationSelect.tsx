import { MenuItem, Skeleton } from '@mui/material'

import { type ListingLocation, listingLocations } from '@configs/filters'

import Select from 'components/atoms/PatchedSelect'

import useClientSide from 'hooks/useClientSide'
import { formatUnionKey } from 'utils/strings'

const ListingLocationSelect = ({
  size,
  value,
  onChange
}: {
  size: 'medium' | 'small'
  disabled?: boolean
  value: ListingLocation
  onChange: (newValue: ListingLocation) => void
}) => {
  const clientSide = useClientSide()

  const handleChange = (e: any) => {
    const value = e.target.value as ListingLocation
    onChange?.(value)
  }

  if (!clientSide)
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 130, sm: 148 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )

  return (
    <Select
      size={size}
      value={value}
      variant="filled"
      onChange={handleChange}
      sx={{
        width: { xs: 130, sm: 148 }
      }}
    >
      {listingLocations.map((type) => (
        <MenuItem
          key={type}
          value={type.replace(' ', '-').replace('&', '-').toLowerCase()}
          // value={type.toLowerCase()}
        >
          {formatUnionKey(type)}
        </MenuItem>
      ))}
    </Select>
  )
}

export default ListingLocationSelect
