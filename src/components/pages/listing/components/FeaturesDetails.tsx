import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'
import { type DetailsGroupType } from 'utils/dataMapper'
import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const FeaturesDetails = ({ features }: { features?: DetailsGroupType[] }) => {
  const t = useTranslations()
  const { features: contextFeatures } = usePropertyDetails()
  const data = features || contextFeatures

  if (!data || data.length === 0) return null

  return (
    <DetailsContainer title={t('pdp.sections.features.name')} id="features">
      <DetailsList>
        {data.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default FeaturesDetails
