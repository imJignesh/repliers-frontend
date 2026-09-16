import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { jest } from '@jest/globals'

const fetchFeatured = jest.fn<() => Promise<object[]>>()
jest.unstable_mockModule('services/API/fetchFeaturedBuildings', () => ({
  fetchFeaturedBuildings: fetchFeatured
}))
jest.unstable_mockModule('@shared/Property', () => ({
  BuildingCard: ({
    building
  }: {
    building: { name: string; link: string }
  }) => <a href={building.link}>{building.name}</a>
}))
const { default: PopularBuildings } = await import('./PopularBuildings')
let root: Root, container: HTMLDivElement
Object.assign(global, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  fetchFeatured.mockReset()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
})
const render = async () => {
  await act(async () => root.render(<PopularBuildings />))
}
it('shows loading then cards with local /r building links', async () => {
  let resolve!: (value: object[]) => void
  fetchFeatured.mockReturnValue(
    new Promise((done) => {
      resolve = done
    })
  )
  await render()
  expect(container.textContent).toContain('Loading popular buildings')
  await act(async () =>
    resolve([{ slug: 'sample', name: 'Sample', link: 'https://wrong.test' }])
  )
  expect(container.querySelector('a')?.getAttribute('href')).toBe(
    '/r/building/sample'
  )
  expect(container.textContent).not.toContain('Loading popular buildings')
})
it('explains empty results', async () => {
  fetchFeatured.mockResolvedValue([])
  await render()
  expect(container.textContent).toContain('No popular buildings are available')
})
it('shows an error and recovers on retry', async () => {
  fetchFeatured
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([{ slug: 'sample', name: 'Sample' }])
  await render()
  expect(container.textContent).toContain('couldn’t be loaded')
  await act(async () => container.querySelector('button')?.click())
  expect(container.querySelector('a')?.textContent).toBe('Sample')
  expect(fetchFeatured).toHaveBeenCalledTimes(2)
})
