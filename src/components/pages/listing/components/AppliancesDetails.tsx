import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'
import { type DetailsGroupType } from 'utils/dataMapper'

const AppliancesDetails = ({ appliances }: { appliances?: DetailsGroupType[] }) => {
  const t = useTranslations()

  if (!appliances || appliances.length === 0) return null

  return (
    <DetailsContainer title={t('pdp.sections.appliances.name')} id="appliances">
      <DetailsList>
        {appliances.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default AppliancesDetails
