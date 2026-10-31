import { jest } from '@jest/globals'

jest.unstable_mockModule('@configs/routes', () => ({ default: { home: '/r/' } }))

let rootPage = 'landing'
const estimateMetadata = jest.fn(async () => ({ title: 'Estimate' }))
jest.unstable_mockModule('utils/features', () => ({
  fetchFeatures: async () => ({ rootPage })
}))
jest.unstable_mockModule('next/headers', () => ({ headers: async () => ({}) }))
jest.unstable_mockModule('utils/urls', () => ({
  getProtocolHost: () => 'https://precondo.ca'
}))
jest.unstable_mockModule('components/templates/PageTemplate', () => ({
  default: 'landing-template'
}))
jest.unstable_mockModule('@pages/home', () => ({ default: 'landing-content' }))
jest.unstable_mockModule('app/(Estimates)/estimate/[[...slugs]]/page', () => ({
  default: 'estimate-content',
  generateMetadata: estimateMetadata
}))
const { default: HomePage, generateMetadata } = await import('./page')
afterEach(() => {
  delete process.env.NEXT_PUBLIC_ROOT_PAGE
  rootPage = 'landing'
})
it('renders the landing page and canonical when estimate mode is not configured', async () => {
  process.env.NEXT_PUBLIC_ROOT_PAGE = 'landing'
  // The page wraps the template in a fragment with a preload for the banner
  // photo, the mobile Largest Contentful Paint element (audit RT08).
  const children = [(await HomePage({})).props.children].flat()
  const template = children.find((child) => child?.type === 'landing-template')
  const preload = children.find((child) => child?.type === 'link')
  expect(template).toBeTruthy()
  expect(preload?.props).toMatchObject({
    rel: 'preload',
    as: 'image',
    fetchPriority: 'high',
    href: expect.stringContaining('precondo_main_image')
  })
  expect((await generateMetadata({})).alternates?.canonical).toBe(
    'https://precondo.ca/r/'
  )
})
it('preserves the alternate estimate page and its metadata when configured', async () => {
  process.env.NEXT_PUBLIC_ROOT_PAGE = 'estimate'
  rootPage = 'estimate'
  expect((await HomePage({})).type).toBe('estimate-content')
  expect(await generateMetadata({})).toEqual({ title: 'Estimate' })
})
