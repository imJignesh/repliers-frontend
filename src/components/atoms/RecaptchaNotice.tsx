import { Typography } from '@mui/material'

/**
 * Audit (4 Nov 2026): the floating reCAPTCHA badge covered controls on phones.
 * Google allows hiding the badge when forms show this notice instead.
 */
const RecaptchaNotice = () => (
  <Typography
    variant="caption"
    color="text.secondary"
    sx={{ display: 'block', textAlign: 'center' }}
  >
    This site is protected by reCAPTCHA and the Google{' '}
    <a
      href="https://policies.google.com/privacy"
      target="_blank"
      rel="noopener noreferrer"
    >
      Privacy Policy
    </a>{' '}
    and{' '}
    <a
      href="https://policies.google.com/terms"
      target="_blank"
      rel="noopener noreferrer"
    >
      Terms of Service
    </a>{' '}
    apply.
  </Typography>
)

export default RecaptchaNotice
