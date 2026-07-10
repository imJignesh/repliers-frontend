import { type ApiQueryResponse, type Property } from 'services/API'

/**
 * A building page has no single "property" of its own — it's derived either
 * from its first unit listing, or (if no listings) a skeleton built from the
 * curated building record. Shared by BuildingPageTemplate and the building
 * JSON-LD generator so both stay in sync with what's actually displayed.
 */
export const deriveBuildingProperty = (
  property: ApiQueryResponse
): Property | null => {
  let p = property?.listings?.[0]

  // If we have curated content for this building in Laravel, it should ALWAYS take precedence
  // over the description of any individual unit listing from Repliers.
  if (p && property.building?.content) {
    if (!p.details) p.details = {} as any
    p.details.description = property.building.content
      ; (p as any).description = property.building.content
  }

  if (!p && property.building) {
    // Use cached response if available, otherwise create a skeleton property object
    const cached = property.building.cached_response

    p = {
      ...(cached || {}),
      address: {
        streetNumber: property.building.street?.number || cached?.address?.streetNumber,
        streetName: property.building.street?.name || cached?.address?.streetName,
        streetSuffix: property.building.street?.suffix || cached?.address?.streetSuffix,
        area: property.building.location?.area?.name || cached?.address?.area,
        city: property.building.location?.city?.name || cached?.address?.city,
        neighborhood: property.building.location?.locality?.name || cached?.address?.neighborhood
      } as any,
      images: (property.building.cover_photo_url ? [property.building.cover_photo_url] : []).concat(cached?.images || []),
      details: {
        ...(cached?.details || {}),
        description: property.building.content || cached?.details?.description
      } as any,
      building: property.building
    } as any
  }

  if (!p) return null

  // Attach building metadata to the listing object so it's available via useProperty()
  if (property.building && !(p as any).building) {
    (p as any).building = property.building
  }

  return p
}
