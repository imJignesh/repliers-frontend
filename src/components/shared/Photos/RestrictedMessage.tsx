import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { Box, Stack, Typography } from '@mui/material'

import content from '@configs/content'

export type RestrictedMessageVariant = 'card' | 'gallery' | 'map'

const RestrictedMessage = ({
  variant = 'card'
}: {
  variant: RestrictedMessageVariant
}) => {
  const iconFontSize = variant === 'gallery' ? 'large' : 'medium'
  const messageVariant = variant === 'gallery' ? 'body2' : 'caption'

  return (
    <Box
      sx={{
        top: '50%',
        left: '0%',
        width: '100%',
        position: 'absolute',
        transform: 'translate(0%, -50%)'
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        {variant === 'card' ? (
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.5,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              color: 'common.white',
              textAlign: 'center',
              width: 'max-content',
              maxWidth: '90%',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'common.white',
                lineHeight: 1.2
              }}
            >
              REGISTER TO VIEW PHOTOS
            </Typography>
          </Box>
        ) : (
          <>
            <VisibilityOffOutlinedIcon
              fontSize={iconFontSize}
              sx={{ color: 'common.white' }}
            />
            {variant !== 'map' && (
              <Typography
                variant={messageVariant}
                sx={{
                  px: 5,
                  maxWidth: 400,
                  textAlign: 'center',
                  color: 'common.white'
                }}
              >
                {content.restrictedPropertyTitle}
              </Typography>
            )}
          </>
        )}
      </Stack>
    </Box>
  )
}

export default RestrictedMessage
