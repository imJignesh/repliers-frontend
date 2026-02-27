import React from 'react'
import { useTranslations } from 'next-intl'
import { Box, Typography } from '@mui/material'

import { DetailsContainer } from '@shared/Containers'
import { type DetailsGroupType } from 'utils/dataMapper'
import { useProperty } from 'providers/PropertyProvider'

const FeaturesDetails = ({ features }: { features?: DetailsGroupType[] }) => {
  const t = useTranslations()
  const { property } = useProperty()
  const building = (property as any)?.building
  const amenities = building?.amenities

  const amenitiesList = Array.isArray(amenities)
    ? amenities
    : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [])

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

  const hasBuildingDetails = building?.type || building?.management || building?.corp || building?.date_registered

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
          <Box>
            <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
              Building Type
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {building?.type || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
              Property Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {parseManagement(building?.management) || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
              Condo Corp
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {building?.corp || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
              Date Registered
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {building?.date_registered || '-'}
            </Typography>
          </Box>
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
