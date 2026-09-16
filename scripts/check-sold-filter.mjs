// Browser regression checks against a built app. Sold responses are controlled
// fixtures so empty, delayed, and failed requests do not depend on live inventory.
// Run: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-sold-filter.mjs URL
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.argv[2] || 'http://localhost:3000'
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const results = []
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
let mode = 'empty'
let lastMap = null
let activeResponse
const empty = { page: 1, numPages: 0, pageSize: 96, count: 0, statistics: {}, listings: [] }
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

if (base.includes('localhost')) {
  // Vercel supplies this public-mount rewrite in deployed previews.
  await page.route(`${base}/r/**`, async (route) => {
    const response = await route.fetch({ url: route.request().url().replace(`${base}/r/`, `${base}/`) })
    await route.fulfill({ response })
  })
}

await page.route('**/api/listings/search?**', async (route) => {
  const params = new URL(route.request().url()).searchParams
  lastMap = params.get('map')
  if (params.get('status') !== 'U') {
    const response = await route.fetch()
    activeResponse = await response.json()
    await route.fulfill({ response })
    return
  }
  await pause(mode === 'slow' ? 1500 : 400)
  await route.fulfill({
    status: mode === 'failure' ? 503 : 200,
    contentType: 'application/json',
    body: JSON.stringify(mode === 'mismatch' ? activeResponse : empty)
  }).catch(() => {}) // A rapid filter change may abort this intercepted request.
})

const setStatus = async (label) => {
  const selector = page.locator('div[role="combobox"]').filter({ hasText: /^(For Sale|Sold|Both|For Rent)$/ })
  if (page.viewportSize().width < 600) {
    await selector.focus()
    await selector.press('ArrowDown')
  } else await selector.click()
  await page.getByRole('option', { name: label, exact: true }).click()
}
const listingLinks = () => page.locator('a[href*="/listing/"]')
const waitForActive = () => listingLinks().first().waitFor({ timeout: 40000 })
const check = (name) => { results.push({ name, passed: true }); console.log(`PASS ${name}`) }

try {
  await page.goto(`${base}/r/search/map`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.getByRole('button', { name: 'Accept and Close' }).click({ timeout: 15000 }).catch(() => {})
  await waitForActive()
  const count = activeResponse.count
  assert(count > 0)
  check('For Sale renders public active inventory')

  await setStatus('Sold')
  await page.getByText('No listings found in this area!', { exact: true }).waitFor()
  assert.equal(await listingLinks().count(), 0)
  assert.match(await page.locator('body').innerText(), /0 condos were sold/)
  check('Sold zero response clears cards and count')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByText('No listings found in this area!', { exact: true }).waitFor({ timeout: 30000 })
  assert(JSON.parse(lastMap)[0].every(([lng]) => lng < 0))
  check('Reload keeps Sold and western map coordinates')

  await setStatus('For Sale')
  await waitForActive()
  mode = 'slow'
  await setStatus('Sold')
  assert.equal(await listingLinks().count(), 0)
  await setStatus('For Sale')
  await waitForActive()
  await pause(1700)
  assert(await listingLinks().count() > 0)
  assert.match(await page.locator('body').innerText(), /condos available for sale/)
  check('Rapid For Sale → Sold → For Sale ignores the older response')

  mode = 'failure'
  await setStatus('Sold')
  await page.getByRole('alert').filter({ hasText: 'Unable to load listings' }).waitFor()
  assert.equal(await listingLinks().count(), 0)
  mode = 'empty'
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await page.getByText('No listings found in this area!', { exact: true }).waitFor()
  check('Failed search shows Retry and recovers to an honest empty state')

  await setStatus('For Sale')
  await waitForActive()
  mode = 'mismatch'
  await setStatus('Sold')
  await page.getByRole('alert').filter({ hasText: 'Unable to load listings' }).waitFor()
  assert.equal(await listingLinks().count(), 0)
  check('Incorrect active API response is rejected instead of labelled Sold')

  mode = 'empty'
  await setStatus('For Sale')
  await waitForActive()
  await page.getByRole('button', { name: 'Go to page 5', exact: true }).click()
  await waitForActive()
  await setStatus('Sold')
  await page.getByText('No listings found in this area!', { exact: true }).waitFor()
  assert.equal(new URL(page.url()).searchParams.get('page'), null)
  check('Status switch from a later server page resets pagination')

  await page.setViewportSize({ width: 390, height: 844 })
  await setStatus('For Sale')
  await page.getByRole('button', { name: 'Gallery', exact: true }).click()
  await waitForActive()
  await setStatus('Sold')
  await page.getByText('No listings found in this area!', { exact: true }).waitFor()
  assert.equal(await listingLinks().count(), 0)
  check('Mobile carousel clears active properties for Sold')
  assert.deepEqual(errors, [])
} finally {
  await fs.writeFile('/private/tmp/precondo-sold-browser-results.json', JSON.stringify({ base, results, errors, controlledSoldResponses: true }, null, 2))
  await page.screenshot({ path: '/private/tmp/precondo-sold-browser-final.png' })
  await browser.close()
}
