import React from 'react'
import Link from 'next/link'
import { getCatalogUrl } from 'utils/urls'

import routes from '@configs/routes'

import { type AutosuggestionOption } from 'services/API'

import { getAreaLabel } from '../utils'

import OptionItem from './OptionItem'

const OptionArea = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement>
  option: AutosuggestionOption
}) => {
  const { source, parent } = option
  const { name } = source as any
  const { name: parentName } = (parent as any) || {}

  const areaUrl = (parentName && parentName.toLowerCase() !== name.toLowerCase())
    ? getCatalogUrl(parentName, name)
    : getCatalogUrl(name)

  return (
    <OptionItem {...props} badge="Location">
      <Link href={areaUrl}>
        {getAreaLabel(option)}
      </Link>
    </OptionItem>
  )
}

export default OptionArea
