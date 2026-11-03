import { toCardListing } from './cardListing'

describe('toCardListing', () => {
  it('drops fields cards never read and keeps the rest', () => {
    const listing: any = {
      mlsNumber: 'C1',
      images: ['a.jpg'],
      rooms: [{ description: 'Living' }],
      details: { numBedrooms: 2, description: '<p>long</p>' },
      building: {
        id: 7,
        slug: '55-bremner',
        location: { area: { name: 'Toronto' } },
        content: '<p>building</p>',
        cached_response: { details: {} }
      }
    }
    const card: any = toCardListing(listing)
    expect(card).toEqual({
      mlsNumber: 'C1',
      images: ['a.jpg'],
      details: { numBedrooms: 2 },
      building: {
        id: 7,
        slug: '55-bremner',
        location: { area: { name: 'Toronto' } }
      }
    })
    expect(listing.building.content).toBe('<p>building</p>')
  })

  it('handles listings without building or details', () => {
    expect(toCardListing({ mlsNumber: 'C2' } as any)).toEqual({
      mlsNumber: 'C2'
    })
  })
})
