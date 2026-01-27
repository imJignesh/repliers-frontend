import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'
import { type DetailsGroupType } from 'utils/dataMapper'

const ExteriorDetails = ({ exterior }: { exterior?: DetailsGroupType[] }) => {
  const t = useTranslations()

  if (!exterior || exterior.length === 0) return null

  return (
    <DetailsContainer title={t('pdp.sections.exterior.name')} id="exterior">
      <DetailsList>
        {exterior.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default ExteriorDetails
