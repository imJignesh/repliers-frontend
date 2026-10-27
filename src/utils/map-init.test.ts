import { jest } from '@jest/globals'

let shouldThrow = false
const handlers: Record<string, () => void> = {}
jest.unstable_mockModule('mapbox-gl', () => ({
  Map: class {
    constructor() {
      if (shouldThrow) throw new Error('Failed to initialize WebGL.')
    }
    on(event: string, handler: () => void) {
      handlers[event] = handler
    }
  }
}))
const { createMap, describeMapFailure, isRecoverableMapFailure } =
  await import('./map-init')

describe('map initialization containment (audit RT05)', () => {
  beforeEach(() => {
    shouldThrow = false
    for (const key of Object.keys(handlers)) delete handlers[key]
  })

  it('returns a failure instead of throwing when WebGL cannot be initialized', () => {
    shouldThrow = true
    const result = createMap({ container: 'map' })
    expect(result.map).toBeNull()
    expect(result.failure?.kind).toBe('init')
    expect(result.failure?.message).toContain('WebGL')
    expect(result.failure?.message).toContain('Failed to initialize WebGL.')
    expect(isRecoverableMapFailure(result.failure)).toBe(false)
  })

  it('returns the map and reports a later context loss as recoverable', () => {
    const onContextLost = jest.fn()
    const result = createMap({ container: 'map' }, onContextLost)
    expect(result.map).not.toBeNull()
    expect(result.failure).toBeNull()
    handlers.webglcontextlost()
    expect(onContextLost).toHaveBeenCalledTimes(1)
    const failure = onContextLost.mock.calls[0][0] as ReturnType<
      typeof describeMapFailure
    >
    expect(failure.kind).toBe('context-lost')
    expect(isRecoverableMapFailure(failure)).toBe(true)
  })

  it('keeps the explanation readable when the error carries no detail', () => {
    expect(describeMapFailure('init').message).not.toContain('(')
    expect(describeMapFailure('init', 'no context').message).toContain(
      '(no context)'
    )
    expect(isRecoverableMapFailure(null)).toBe(false)
  })
})
