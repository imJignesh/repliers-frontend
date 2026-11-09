import { jest } from '@jest/globals'

import { executeRecaptcha, RECAPTCHA_LOAD_TIMEOUT_MS } from './recaptcha'

// Audit R09 (6 Nov 2026 retest): when the helper added the script itself and
// neither load nor error fired, the enquiry stayed pending forever.
describe('executeRecaptcha script loading', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-key'
    delete (window as any).grecaptcha
    document.querySelectorAll('script').forEach((s) => s.remove())
    jest.useFakeTimers()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('settles with an empty token when a new script never loads', async () => {
    const result = executeRecaptcha('lead')
    const script = document.querySelector('script[src*="recaptcha/api.js"]')
    expect(script).not.toBeNull()
    jest.advanceTimersByTime(RECAPTCHA_LOAD_TIMEOUT_MS)
    await expect(result).resolves.toBe('')
  })

  it('settles with an empty token when the script errors', async () => {
    const result = executeRecaptcha('lead')
    document
      .querySelector('script[src*="recaptcha/api.js"]')!
      .dispatchEvent(new Event('error'))
    await expect(result).resolves.toBe('')
    expect(jest.getTimerCount()).toBe(0)
  })

  it('settles when an existing script never becomes ready', async () => {
    const queued = document.createElement('script')
    queued.src = 'https://www.google.com/recaptcha/api.js?render=test-key'
    document.head.appendChild(queued)
    const result = executeRecaptcha('lead')
    jest.advanceTimersByTime(RECAPTCHA_LOAD_TIMEOUT_MS)
    await expect(result).resolves.toBe('')
    expect(jest.getTimerCount()).toBe(0)
  })
})
