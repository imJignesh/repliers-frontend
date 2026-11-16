import React, { useEffect } from 'react'
import Link from 'next/link'

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'

import { useDialog } from 'providers/DialogProvider'

import BaseResponsiveDialog from './BaseResponsiveDialog'

const dialogName = 'cookie'

const { cookieKey } = storageConfig

const CookieDialog = () => {
  const { showDialog, hideDialog } = useDialog(dialogName)

  const handleAccept = () => {
    localStorage.setItem(cookieKey, 'true')
    hideDialog()
  }

  // T07 (Nov full-site audit): closing with X or a click outside also counts
  // as "continuing", per the notice text, so the banner stays closed instead of
  // coming back on every page.
  const handleDismiss = () => {
    try {
      if (!localStorage.getItem(cookieKey)) localStorage.setItem(cookieKey, 'dismissed')
    } catch {
      /* storage blocked: the banner may show again, nothing else breaks */
    }
  }

  useEffect(() => {
    const cookieAccepted = !!localStorage.getItem(cookieKey)
    if (!cookieAccepted) showDialog()
  }, [])

  return (
    <BaseResponsiveDialog name={dialogName} onClose={handleDismiss}>
      <DialogTitle>Cookie Consent</DialogTitle>
      <DialogContent
        sx={{
          textAlign: 'center',
          '& a': { textDecoration: 'underline' }
        }}
      >
        By continuing to search or by clicking “Accept”, you agree to the
        storing of cookies to enhance your site experience and for analytical
        purposes. To learn more about how we use the cookies, please see our{' '}
        <Link href={routes.cookies} target="_blank">
          cookies policy
        </Link>
        .
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="large" onClick={handleAccept}>
          Accept and Close
        </Button>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

export default CookieDialog
