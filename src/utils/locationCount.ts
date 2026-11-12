/**
 * The count a location chip shows: buildings in the Buildings view, listings
 * otherwise. It used to show listings in both views (falling back to
 * buildings only when a place had no listings), so switching views changed
 * the total but not the chips.
 */
export const locationCount = (
  item: { listing_count?: number | string | null; building_count?: number | string | null },
  viewMode: 'listings' | 'buildings'
) => Number((viewMode === 'buildings' ? item.building_count : item.listing_count) ?? 0) || 0
