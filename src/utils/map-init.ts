import { Map as MapboxMap, type MapOptions } from 'mapbox-gl'

/**
 * Mapbox GL throws synchronously from its constructor when the browser cannot
 * create a WebGL context ("Failed to initialize WebGL"). Left uncaught inside
 * a React effect that error unmounts the whole search page and shows the
 * generic 500 screen, taking filters, results and pagination with it
 * (audit RT05, 21 October 2026). This module turns both the constructor
 * failure and a later `webglcontextlost` event into plain state.
 */

export type MapFailureKind = 'init' | 'context-lost'

export type MapFailure = {
  kind: MapFailureKind
  message: string
}

export const MAP_FAILURE_MESSAGES: Record<MapFailureKind, string> = {
  init: 'The interactive map could not be started because this browser has no usable WebGL graphics. Your filters, results and pagination still work in the list.',
  'context-lost':
    'The map lost its graphics context. Your filters and results are unaffected; you can reload the map.'
}

export const describeMapFailure = (
  kind: MapFailureKind,
  error?: unknown
): MapFailure => {
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : ''
  return {
    kind,
    message: detail
      ? `${MAP_FAILURE_MESSAGES[kind]} (${detail})`
      : MAP_FAILURE_MESSAGES[kind]
  }
}

// Only a lost context can be recovered by building the map again; a missing
// WebGL implementation will fail identically on every attempt.
export const isRecoverableMapFailure = (failure: MapFailure | null) =>
  failure?.kind === 'context-lost'

export type CreateMapResult =
  | { map: MapboxMap; failure: null }
  | { map: null; failure: MapFailure }

export const createMap = (
  options: MapOptions,
  onContextLost?: (failure: MapFailure) => void
): CreateMapResult => {
  try {
    const map = new MapboxMap(options)
    if (onContextLost) {
      map.on('webglcontextlost', () =>
        onContextLost(describeMapFailure('context-lost'))
      )
    }
    return { map, failure: null }
  } catch (error) {
    return { map: null, failure: describeMapFailure('init', error) }
  }
}
