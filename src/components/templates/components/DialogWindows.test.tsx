import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { jest } from '@jest/globals'

let nextId = 0
jest.unstable_mockModule('next/dynamic', () => ({
  default: () => {
    const id = nextId++
    return () => <div data-deferred-dialog={id} />
  }
}))
jest.unstable_mockModule('@shared/Dialogs/CookieDialog', () => ({
  default: () => <div data-cookie-dialog />
}))
jest.unstable_mockModule('providers/FeaturesProvider', () => ({
  useFeatures: () => ({
    favorites: true,
    saveSearch: true,
    imageFavorites: true,
    cookieConsent: true
  })
}))
let query = ''
jest.unstable_mockModule('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(query)
}))
const { default: DialogProvider, useDialogContext } =
  await import('providers/DialogProvider')
const { default: DialogWindows } = await import('./DialogWindows')
let dialogs: ReturnType<typeof useDialogContext>
const Consumer = () => {
  dialogs = useDialogContext()
  return <DialogWindows />
}
let root: Root, container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  query = ''
  container = document.createElement('div')
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
})
const render = () =>
  act(() =>
    root.render(
      <DialogProvider>
        <Consumer />
      </DialogProvider>
    )
  )
it('keeps optional dialogs unmounted until used while retaining cookie consent', () => {
  render()
  expect(container.querySelectorAll('[data-deferred-dialog]')).toHaveLength(0)
  expect(container.querySelector('[data-cookie-dialog]')).not.toBeNull()
})
it('loads the requested dialog and keeps it mounted through close and reopen', () => {
  render()
  act(() => dialogs.showDialog('auth'))
  const dialog = container.querySelector('[data-deferred-dialog]')
  expect(dialog).not.toBeNull()
  act(() => dialogs.hideDialog('auth'))
  expect(container.querySelector('[data-deferred-dialog]')).toBe(dialog)
  act(() => dialogs.showDialog('otp-auth'))
  expect(container.querySelectorAll('[data-deferred-dialog]')).toHaveLength(2)
})
it('preserves dialog query-string entry points', () => {
  query = 'dialog=otp-auth'
  render()
  expect(dialogs.visible('otp-auth')).toBe(true)
  expect(container.querySelectorAll('[data-deferred-dialog]')).toHaveLength(1)
})
