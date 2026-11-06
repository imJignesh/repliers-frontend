import { closestLocation, editDistance } from './closestLocation'

const option = (name: string) => ({ type: 'city', source: { name } }) as any
const index = [option('Mississauga'), option('Milton'), option('Markham')]
const search = (q: string) =>
  index.filter((o) => o.source.name.toLowerCase().startsWith(q))

describe('closestLocation (audit R07)', () => {
  it('suggests Mississauga for Missisauga', () => {
    expect(closestLocation('Missisauga', search)?.source).toEqual({
      name: 'Mississauga'
    })
  })
  it('suggests nothing for unrelated or short queries', () => {
    expect(closestLocation('Union Station', search)).toBeNull()
    expect(closestLocation('Mis', search)).toBeNull()
  })
  it('computes edit distance', () => {
    expect(editDistance('missisauga', 'mississauga')).toBe(1)
  })
})
