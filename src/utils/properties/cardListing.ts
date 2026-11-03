import { type Property } from 'services/API'

/**
 * RT08: location pages hand their listings to client components, so every
 * field is serialized into the page and parsed before hydration. Cards and
 * the map never read the building's stored description or cached feed copy,
 * the listing's long description or its room list, and on a 24-card page
 * those made up most of the ~600 KB payload. Drop them for the client copy.
 */
export const toCardListing = (listing: Property): Property => {
  const card: any = { ...listing }
  delete card.rooms
  if (card.details) {
    card.details = { ...card.details }
    delete card.details.description
  }
  if (card.building) {
    card.building = { ...card.building }
    delete card.building.content
    delete card.building.cached_response
  }
  return card as Property
}
