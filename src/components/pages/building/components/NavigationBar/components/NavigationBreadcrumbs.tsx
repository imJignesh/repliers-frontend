import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { Breadcrumbs, Link } from '@mui/material'

import routes from '@configs/routes'

import { useProperty } from 'providers/PropertyProvider'
import { getLocationBreadcrumbItems } from 'utils/structuredData'

const NavigationBreadcrumbs = () => {
  const { property } = useProperty()
  const locationItems = getLocationBreadcrumbItems(
    property.address,
    '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (property as any).building?.location
  )

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ fontSize: 14, '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
    >
      <Link key="for-sale" underline="hover" color="inherit" href={routes.map}>
        For sale
      </Link>
      {locationItems.map(({ name, url }) => (
        <Link key={url} underline="hover" color="inherit" href={url}>
          {name}
        </Link>
      ))}
    </Breadcrumbs>
  )
}

export default NavigationBreadcrumbs
