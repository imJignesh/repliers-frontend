import { type Filters } from 'services/Search/types'

// Empty values (undefined, null, '', 0, []) mean "no restriction", so two
// filter sets that differ only by those are the same search.
const isEmptyValue = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === '' ||
  v === 0 ||
  (Array.isArray(v) && v.length === 0)

export const stableKey = (f: Partial<Filters>) =>
  JSON.stringify(
    Object.keys(f)
      .filter((k) => !isEmptyValue((f as any)[k]))
      .sort()
      .map((k) => [k, (f as any)[k]])
  )

export const sameFilters = (a: Partial<Filters>, b: Partial<Filters>) =>
  stableKey(a) === stableKey(b)
