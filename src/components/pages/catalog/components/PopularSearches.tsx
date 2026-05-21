import defaultLocation from '@configs/location'

import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import GroupTemplate from './GroupTemplate'

const filters = [
  ['condos', 'for-sale'],
  ['condos', 'for-rent'],
  ['condos', 'above-500k'],
  ['condos', 'above-800k'],
  ['condos', 'above-1m'],
  ['1-bedroom', 'condos', 'for-sale'],
  ['2-bedrooms', 'condos', 'for-sale'],
  ['3-bedrooms', 'condos', 'for-sale'],
  ['1-bathroom', 'condos', 'for-sale'],
  ['2-bathrooms', 'condos', 'for-sale'],
  ['luxury', 'condos', 'for-sale'],
  ['premium', 'condos', 'for-sale']
]

const formatLabel = (label: string) =>
  capitalize(label.replace('-', ' ')).replace(
    /(\d+(\.\d+)?)([km])/,
    (_, num, __, suffix) => `${num}${suffix.toUpperCase()}`
  )

const PopularSearches = ({
  area,
  city,
  hood
}: {
  area?: string
  city?: string
  hood?: string
}) => {
  const items = filters.map((filterItems) => {
    const regionName = capitalize(hood || city || area || defaultLocation.state)
    const formattedFilters = capitalize(filterItems.map(formatLabel).join(' '))

    return {
      name: `${formattedFilters} in ${regionName}`,
      link: getCatalogUrl(area, city, hood, filterItems)
    }
  })

  return (
    <GroupTemplate title="Popular Searches" items={items} direction="column" />
  )
}

export default PopularSearches
