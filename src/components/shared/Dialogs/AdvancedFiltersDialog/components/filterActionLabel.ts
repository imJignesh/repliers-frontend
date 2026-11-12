import { toSafeNumber } from 'utils/formatters'
import { pluralize } from 'utils/strings'

/**
 * Text of the filter drawer's apply button. `noun` is "building" in the
 * catalog's Buildings view, where the count is of buildings with a matching
 * listing; a negative count means the count is unknown.
 */
export const filterActionLabel = (
  count: number | null,
  invalid = false,
  noun: 'listing' | 'building' = 'listing'
) =>
  invalid
    ? 'Fix highlighted filters'
    : count === null || count < 0
      ? `Show ${noun}s` // still counting, or count unknown: never a stale or zero number
      : `Show ${pluralize(toSafeNumber(count), {
          one: `1 ${noun}`,
          many: `$ ${noun}s`
        })}`
