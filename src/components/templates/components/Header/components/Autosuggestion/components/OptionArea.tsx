import React from 'react'
import Link from 'next/link'

import routes from '@configs/routes'

import { type ApiBoardCity, type AutosuggestionOption } from 'services/API'

import { getAreaLabel } from '../utils'

import OptionItem from './OptionItem'

const OptionArea = ({
  props,
  option
}: {
  props: React.HTMLAttributes<HTMLLIElement>
  option: AutosuggestionOption
}) => {
  // Link to the published location's catalog page using the full canonical path
  // (area/city/neighbourhood) supplied by the backend.
  const source = option.source as ApiBoardCity
  const areaUrl = source?.path
    ? `${routes.listings}/${source.path}`
    : `${routes.area}/?q=${encodeURIComponent(getAreaLabel(option))}`

  return (
    <OptionItem {...props} badge="Location">
      <Link
        href={areaUrl}
        onClick={(e) => {
          e.preventDefault()
        }}
      >
        {getAreaLabel(option)}
      </Link>
    </OptionItem>
  )
}

export default OptionArea
