import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsChipsGroup, DetailsList } from '@shared/DetailsList'
import { type DetailsGroupType } from 'utils/dataMapper'

const NeighborhoodDetails = ({ neighborhood }: { neighborhood?: DetailsGroupType[] }) => {
  const t = useTranslations()

  if (!neighborhood || neighborhood.length === 0) return null

  return (
    <DetailsContainer
      title={t('pdp.sections.neighborhood.name')}
      id="neighborhood"
    >
      <DetailsList mode="flex">
        {neighborhood.map((group, index) => (
          <DetailsChipsGroup key={index} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default NeighborhoodDetails
