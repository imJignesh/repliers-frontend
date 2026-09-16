import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { jest } from '@jest/globals'

jest.unstable_mockModule('next/dynamic', () => ({
  default: () => () => <div data-charts />
}))
const { default: DeferredStats } = await import('./DeferredStats')
let root: Root, container: HTMLDivElement
let intersect: IntersectionObserverCallback
const disconnect = jest.fn()
const originalObserver = global.IntersectionObserver
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  disconnect.mockClear()
  global.IntersectionObserver = class {
    constructor(callback: IntersectionObserverCallback) {
      intersect = callback
    }
    observe() {}
    disconnect = disconnect
  } as unknown as typeof IntersectionObserver
  container = document.createElement('div')
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  global.IntersectionObserver = originalObserver
})
it('loads charts only near the viewport and retains them afterwards', () => {
  act(() => root.render(<DeferredStats city="Toronto" name="Toronto" />))
  expect(container.querySelector('[data-charts]')).toBeNull()
  act(() =>
    intersect(
      [{ isIntersecting: false }] as IntersectionObserverEntry[],
      {} as IntersectionObserver
    )
  )
  expect(container.querySelector('[data-charts]')).toBeNull()
  act(() =>
    intersect(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver
    )
  )
  expect(container.querySelector('[data-charts]')).not.toBeNull()
  expect(disconnect).toHaveBeenCalled()
})
it('keeps charts available without IntersectionObserver support', () => {
  delete (global as { IntersectionObserver?: typeof IntersectionObserver })
    .IntersectionObserver
  act(() => root.render(<DeferredStats city="Toronto" name="Toronto" />))
  expect(container.querySelector('[data-charts]')).not.toBeNull()
})
