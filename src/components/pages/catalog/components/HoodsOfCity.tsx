import { type ApiNeighborhood } from 'services/API'
import { capitalize } from 'utils/strings'
import { getCatalogUrl } from 'utils/urls'

import { maxChilds } from '../constants'

import { GroupTemplate } from '.'

const HoodsOfCity = ({
  hoods,
  city,
  isArea = false
}: {
  hoods: ApiNeighborhood[]
  city: string
  isArea?: boolean
}) => {
  if (!city || !hoods.length) return null

  const items = hoods.filter(({ name }) => name !== city.toLowerCase())

  return (
    <GroupTemplate
      title={`${isArea ? 'Cities' : 'Neighborhoods'} of ${city}`}
      items={items.map(({ name, activeCount }) => ({
        name: capitalize(name),
        link: isArea ? getCatalogUrl(name) : getCatalogUrl(city, name),
        count: activeCount
      }))}
    />
  )
}

export default HoodsOfCity
