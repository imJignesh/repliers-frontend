import { type MapStyle } from '@configs/map'

export type Params = {
  layout: 'map' | 'grid'
  style: MapStyle
}

export type SearchParams = {
  q?: string
  searchId: number
  aiImage: string
  aiFeature: string
}
