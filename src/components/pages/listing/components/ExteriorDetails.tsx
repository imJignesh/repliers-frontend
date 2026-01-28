import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'
import { type DetailsGroupType } from 'utils/dataMapper'
import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const ExteriorDetails = ({ exterior }: { exterior?: DetailsGroupType[] }) => {
  const t = useTranslations()
  const { exterior: contextExterior } = usePropertyDetails()
  const data = exterior || contextExterior

  if (!data || data.length === 0) return null

  return (
    <DetailsContainer title={t('pdp.sections.exterior.name')} id="exterior">
      <DetailsList>
        {data.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default ExteriorDetails
