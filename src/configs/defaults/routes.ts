const routes = {
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
  listings: '/r/locations',
  estimate: '/r/estimate',
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

  // will be set to home or dashboard or agent
  loginRedirect: '/r/'
}

export type Routes = Record<keyof typeof routes, string>

export default routes
