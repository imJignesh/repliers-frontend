import React from 'react'
import { useTranslations } from 'next-intl'

import { DetailsContainer } from '@shared/Containers'
import { DetailsGroup, DetailsList } from '@shared/DetailsList'
import { type DetailsGroupType } from 'utils/dataMapper'
import { usePropertyDetails } from 'providers/PropertyDetailsProvider'

const AppliancesDetails = ({ appliances }: { appliances?: DetailsGroupType[] }) => {
  const t = useTranslations()
  const { appliances: contextAppliances } = usePropertyDetails()
  const data = appliances || contextAppliances

  if (!data || data.length === 0) return null

  return (
    <DetailsContainer title={t('pdp.sections.appliances.name')} id="appliances">
      <DetailsList>
        {data.map((group) => (
          <DetailsGroup key={group.title} group={group} />
        ))}
      </DetailsList>
    </DetailsContainer>
  )
}

export default AppliancesDetails
