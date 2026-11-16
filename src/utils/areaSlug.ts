/**
 * Slug for an area/neighbourhood name, matching the backend's Str::slug so
 * names with apostrophes, slashes, brackets or periods resolve
 * ("Fletcher's Creek South" -> "fletchers-creek-south",
 * "Meadowlands/Crestview" -> "meadowlandscrestview"). T02, Nov full-site audit.
 */
export const toAreaSlug = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‑_]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
