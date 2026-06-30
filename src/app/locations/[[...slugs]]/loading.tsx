import { PageTemplate } from '@templates'

/**
 * Instant loading UI for the location / catalog route.
 *
 * The page is `force-dynamic` (~2-3s server render). Without a loading boundary,
 * clicking a search result showed nothing until that render finished — it felt
 * like a 2-3s freeze. This renders the header + the app's standard LoadingView
 * immediately on navigation while the page streams in, so the click feels instant.
 */
export default function Loading() {
  return <PageTemplate loading>{null}</PageTemplate>
}
