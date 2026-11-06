import { type AutosuggestionOption } from 'services/API/types'

export const editDistance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      prev = tmp
    }
  }
  return row[b.length]
}

/** Closest known location to a probable misspelling (at most 2 edits). */
export const closestLocation = (
  query: string,
  search: (q: string) => AutosuggestionOption[]
): AutosuggestionOption | null => {
  const q = query.toLowerCase().trim()
  if (q.length < 4) return null
  let best: AutosuggestionOption | null = null
  let bestDistance = 3
  const seen = new Set<string>()
  for (const prefix of [q.slice(0, 3), q.slice(0, 2), q.slice(0, 1)]) {
    for (const option of search(prefix) || []) {
      const name = String((option.source as any)?.name || '').toLowerCase()
      if (!name || seen.has(name)) continue
      seen.add(name)
      const d = editDistance(q, name)
      if (d < bestDistance) {
        best = option
        bestDistance = d
      }
    }
    if (best) break
  }
  return best
}
