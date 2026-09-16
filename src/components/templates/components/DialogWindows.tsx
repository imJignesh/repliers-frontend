'use client'

import { type ComponentType, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

import CookieDialog from '@shared/Dialogs/CookieDialog'

import {
  type DialogName,
  hasDialog,
  useDialog,
  useDialogContext
} from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'

const AuthDialog = dynamic(() => import('@shared/Dialogs/AuthDialog'))
const OtpAuthDialog = dynamic(() => import('@shared/Dialogs/OtpAuthDialog'))
const FavoriteRemoveDialog = dynamic(
  () => import('@shared/Dialogs/FavoriteRemoveDialog')
)
const SaveSearchRemoveDialog = dynamic(
  () => import('@shared/Dialogs/SaveSearchRemoveDialog')
)
const ImageFavoriteRemoveDialog = dynamic(
  () => import('@shared/Dialogs/ImageFavoriteRemoveDialog')
)

// Don't mount an optional dialog until it is requested. Keep it mounted after
// first use so closing animations and form state retain their existing behavior.
const DeferredDialog = ({
  name,
  component: Component
}: {
  name: DialogName
  component: ComponentType
}) => {
  const { visible } = useDialog(name)
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    if (visible) setOpened(true)
  }, [visible])
  return visible || opened ? <Component /> : null
}

const DialogWindows = () => {
  const features = useFeatures()
  const params = useSearchParams()
  const { showDialogInstantly } = useDialogContext()
  const dialogName = params.get('dialog') || ''

  useEffect(() => {
    if (params && hasDialog(dialogName)) {
      showDialogInstantly(dialogName)
    }
  }, [])

  return (
    <>
      <DeferredDialog name="auth" component={AuthDialog} />
      <DeferredDialog name="otp-auth" component={OtpAuthDialog} />
      {features.favorites && (
        <DeferredDialog
          name="remove-favorite"
          component={FavoriteRemoveDialog}
        />
      )}
      {features.saveSearch && (
        <DeferredDialog
          name="delete-saved-search"
          component={SaveSearchRemoveDialog}
        />
      )}
      {features.imageFavorites && (
        <DeferredDialog
          name="remove-image"
          component={ImageFavoriteRemoveDialog}
        />
      )}
      {features.cookieConsent && <CookieDialog />}
    </>
  )
}

export default DialogWindows
