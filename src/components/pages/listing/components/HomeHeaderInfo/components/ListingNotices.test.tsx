import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import ListingNotices from './ListingNotices'

let root: Root, container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  container = document.createElement('div')
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
})

it('names the current listing on a superseded record (audit R04)', () => {
  act(() =>
    root.render(
      <ListingNotices
        property={
          {
            supersededBy: {
              mlsNumber: 'E14124142',
              listPrice: '455000.00',
              listDate: '2026-10-28'
            }
          } as any
        }
      />
    )
  )
  expect(container.textContent).toContain('This unit has been relisted')
  expect(container.textContent).toContain('$455,000')
  expect(container.textContent).toContain('MLS E14124142')
  expect(container.querySelector('a')?.getAttribute('href')).toMatch(
    /\/listing\/E14124142$/
  )
})

it('explains a held-back bedroom count (audit R03)', () => {
  act(() =>
    root.render(
      <ListingNotices
        property={
          { factWarnings: { bedrooms: 'Bedroom count not shown.' } } as any
        }
      />
    )
  )
  expect(container.textContent).toContain('Bedroom count not shown.')
})

it('renders nothing for an ordinary listing', () => {
  act(() => root.render(<ListingNotices property={{} as any} />))
  expect(container.textContent).toBe('')
})
