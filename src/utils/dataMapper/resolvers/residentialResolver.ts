import { type Property } from 'services/API'

import {
  appliancesResolver,
  exteriorResolver,
  featuresResolver,
  homeResolver,
  neighborhoodResolver,
  roomsResolver
} from './residential'

const resolver = (property: Property) => {
  return {
    homeDetails: homeResolver(property),
    features: featuresResolver(property),
    appliances: appliancesResolver(property),
    neighborhood: neighborhoodResolver(property),
    exterior: exteriorResolver(property),
    rooms: roomsResolver(property),
    insights: {
      city: property.address.city,
      neighborhood: property.address.neighborhood
    }
  }
}

export default resolver
