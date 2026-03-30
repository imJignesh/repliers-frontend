import React from 'react'
import Link from 'next/link'
import routes from '@configs/routes'

import OptionItem from './OptionItem'

const OptionBuilding = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement>
  option: any
}) => {
  const { source } = option
  return (
    <OptionItem {...props} badge="Building">
      <Link href={`${routes.building}/${source.slug}`}>
        {source.name}
        <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>
          {source.address}
        </span>
      </Link>
    </OptionItem>
  )
}

export default OptionBuilding
