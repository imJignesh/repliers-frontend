const isLocalhost = () => {
  if (typeof window !== 'undefined') {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    )
  }
  const precondoUrl = process.env.NEXT_PUBLIC_PRECONDO_URL || ''
  return (
    process.env.NODE_ENV === 'development' ||
    precondoUrl.includes('localhost') ||
    precondoUrl.includes('127.0.0.1')
  )
}

const getRoute = (path: string) => {
  if (isLocalhost()) {
    if (path === '/r') return '/'
    if (path.startsWith('/r/')) return path.substring(2)
  }
  return path
}

const rawRoutes = {
  home: '/r',
  login: '/r/login',

  search: '/r/search',
  map: '/r/search/map',
  ai: '/r/search/map?dialog=ai', // NOTE: alias for the toolbar
  grid: '/r/search/grid',

  city: '/r/search/city',
  area: '/r/search/area',
  address: '/r/search/address',

  listing: '/r/listing', // [...id]
  building: '/r/building', // [...id]
  listings: '/r/locations',
  // estimate: '/r/estimate',
  dashboard: '/r/dashboard',
  favorites: '/r/favorites',
  saveSearch: '/r/saved-searches',
  imageFavorites: '/r/image-favorites',
  recentlyViewed: '/r/recently-viewed',
  profile: '/r/profile',

  // estimates management
  admin: '/r/admin',
  adminAgents: '/r/admin/agents',

  agent: '/r/agent',
  agentClient: '/r/agent/client', // [...id]

  // static pages
  cookies: '/r/cookies-policy',
  privacy: '/r/privacy-policy',
  terms: '/r/terms-of-use',
  sitemap: '/r/sitemap',

  // will be set to home or dashboard or agent
  loginRedirect: '/r'
}

export type Routes = Record<keyof typeof rawRoutes, string>

const routes = new Proxy(rawRoutes, {
  get(target, prop) {
    const val = target[prop as keyof typeof rawRoutes]
    if (typeof val === 'string') {
      return getRoute(val)
    }
    return val
  }
}) as unknown as Routes

export default routes
