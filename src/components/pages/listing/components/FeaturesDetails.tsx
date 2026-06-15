import React from 'react'
import { useTranslations } from 'next-intl'
import { Box, Typography } from '@mui/material'

import { DetailsContainer } from '@shared/Containers'
import { type DetailsGroupType } from 'utils/dataMapper'
import { useProperty } from 'providers/PropertyProvider'
import { isPureAmenity } from 'utils/properties'

const isEmptyValue = (val: any) => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') {
    const s = val.trim()
    return (
      s === '' ||
      s === '-' ||
      s.toLowerCase() === 'n/a' ||
      s === '0' ||
      s.toLowerCase() === 'built in -' ||
      s.toLowerCase() === 'built in' ||
      s.toLowerCase() === 'built:' ||
      s.toLowerCase() === 'built: -'
    )
  }
  return false
}

const FeaturesDetails = ({ features }: { features?: DetailsGroupType[] }) => {
  const t = useTranslations()
  const { property } = useProperty()
  const building = (property as any)?.building
  const amenities = building?.amenities

  const amenitiesList = (Array.isArray(amenities)
    ? amenities
    : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()).filter(Boolean) : []))
    .filter(isPureAmenity)

  const maintenanceInclude = building?.included_in_maintenance_fees
  const maintenanceList = typeof maintenanceInclude === 'string'
    ? maintenanceInclude.split('\n').map(item => item.trim()).filter(Boolean)
    : []

  const parseManagement = (text: string) => {
    if (!text) return null
    const match = text.match(/(.*?) \[(.*?)\]/)
    if (match) {
      return (
        <Box component="span">
          {match[1]}
        </Box>
      )
    }
    return text
  }

  const showType = !isEmptyValue(building?.type)
  const showManagement = !isEmptyValue(building?.management)
  const showCorp = !isEmptyValue(building?.corp)
  const showDateRegistered = !isEmptyValue(building?.date_registered)

  const hasBuildingDetails = showType || showManagement || showCorp || showDateRegistered

  if (!hasBuildingDetails && amenitiesList.length === 0 && maintenanceList.length === 0) return null

  return (
    <DetailsContainer title={`Building Details`} id="features">

      {hasBuildingDetails && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: (amenitiesList.length > 0 || maintenanceList.length > 0) ? 4 : 0
        }}>
          {showType && (
            <Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                Building Type
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {building?.type}
              </Typography>
            </Box>
          )}
          {showManagement && (
            <Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                Property Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {parseManagement(building?.management)}
              </Typography>
            </Box>
          )}
          {showCorp && (
            <Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                Condo Corp
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {building?.corp}
              </Typography>
            </Box>
          )}
          {showDateRegistered && (
            <Box>
              <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                Date Registered
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {building?.date_registered}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {amenitiesList.length > 0 && (
        <Box sx={{ mt: hasBuildingDetails ? 4 : 0, pt: hasBuildingDetails ? 4 : 0, borderTop: hasBuildingDetails ? 1 : 0, borderColor: 'divider' }}>
          <Typography component="h3" fontWeight={600} pb={2}>
            Building Amenities
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}>
            {amenitiesList?.map((amenity, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  {amenity}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {maintenanceList.length > 0 && (
        <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Typography component="h3" fontWeight={600} pb={2}>
            Maintenance Fees Include
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}>
            {maintenanceList.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary">
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </DetailsContainer>
  )
}

export default FeaturesDetails
