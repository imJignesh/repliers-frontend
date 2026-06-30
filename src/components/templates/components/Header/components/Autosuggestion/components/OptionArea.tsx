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
  // Link to the published location's catalog page using its real slugs (a city
  // option's parent is the area, a neighbourhood option's parent is the city).
  const source = option.source as ApiBoardCity
  const parent = option.parent as ApiBoardCity | undefined
  const areaUrl = source?.slug
    ? `${routes.listings}/${[parent?.slug, source.slug]
        .filter(Boolean)
        .join('/')}`
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
