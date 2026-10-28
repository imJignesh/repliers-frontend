import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { jest } from '@jest/globals'

// @mui/icons-material ships ESM only; the icons are irrelevant to the names.
jest.unstable_mockModule('@mui/icons-material/NavigateBefore', () => ({
  default: () => <svg data-testid="NavigateBeforeIcon" />
}))
jest.unstable_mockModule('@mui/icons-material/NavigateNext', () => ({
  default: () => <svg data-testid="NavigateNextIcon" />
}))
const { default: GalleryControls } = await import('./GalleryControls')
const noop = () => undefined

let root: Root, container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  container = document.createElement('div')
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
})

// Audit RT06: gallery arrows had empty accessible names.
it('names the previous and next photo arrows', () => {
  const onPrev = jest.fn()
  const onNext = jest.fn()
  act(() => root.render(<GalleryControls onPrev={onPrev} onNext={onNext} />))
  const buttons = container.querySelectorAll('button')
  expect(buttons).toHaveLength(2)
  expect(buttons[0].getAttribute('aria-label')).toBe('Previous photo')
  expect(buttons[1].getAttribute('aria-label')).toBe('Next photo')
  act(() => buttons[0].click())
  act(() => buttons[1].click())
  expect(onPrev).toHaveBeenCalledTimes(1)
  expect(onNext).toHaveBeenCalledTimes(1)
})

it('accepts custom labels and keeps hidden arrows focusable for keyboard users', () => {
  act(() =>
    root.render(
      <GalleryControls
        show={false}
        prevLabel="Previous floor plan"
        nextLabel="Next floor plan"
        onPrev={noop}
        onNext={noop}
      />
    )
  )
  const buttons = container.querySelectorAll('button')
  expect(buttons[0].getAttribute('aria-label')).toBe('Previous floor plan')
  expect(buttons[1].getAttribute('aria-label')).toBe('Next floor plan')
  expect(buttons[0].getAttribute('aria-hidden')).toBeNull()
  expect(buttons[0].tabIndex).toBe(0)
})
