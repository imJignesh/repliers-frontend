import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import PricePicker from './PricePicker'

const buckets = {
  '0-100000': 3,
  '100000-200000': 7,
  '200000-300000': 10,
  '300000-400000': 5,
  '400000+': 2
}

let root: Root, container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  container = document.createElement('div')
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
})

const thumbs = () =>
  Array.from(
    container.querySelectorAll<HTMLInputElement>('input[type="range"]')
  )

// Audit RT06: the two thumbs were unnamed and exposed bucket indexes (0, 16)
// instead of prices.
it('names both price thumbs and exposes formatted prices as their values', () => {
  act(() =>
    root.render(
      <PricePicker buckets={buckets} values={[0, 0]} variant="bars" />
    )
  )
  const [min, max] = thumbs()
  expect(min.getAttribute('aria-label')).toBe('Minimum price')
  expect(max.getAttribute('aria-label')).toBe('Maximum price')
  expect(min.value).toBe('0')
  expect(max.value).toBe('4')
  expect(min.getAttribute('aria-valuetext')).toBe('Minimum price $0')
  expect(max.getAttribute('aria-valuetext')).toBe('Maximum price $400K+')
})

it('keeps the announced value in step with the selected price range', () => {
  act(() =>
    root.render(
      <PricePicker buckets={buckets} values={[200000, 400000]} variant="bars" />
    )
  )
  const [min, max] = thumbs()
  expect(min.value).toBe('2')
  expect(max.value).toBe('4')
  expect(min.getAttribute('aria-valuetext')).toBe('Minimum price $200K')
  expect(max.getAttribute('aria-valuetext')).toBe('Maximum price $400K+')
})
