export const getMapSearchHeading = (query?: string) => {
  const normalized = query?.trim().replace(/\s+/g, ' ').slice(0, 80)
  return normalized
    ? `Property search results for ${normalized[0].toUpperCase()}${normalized.slice(1)}`
    : 'Search properties on the map'
}
