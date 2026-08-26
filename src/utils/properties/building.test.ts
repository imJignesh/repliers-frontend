import { sanitizeBuildingContent } from './building'

describe('sanitizeBuildingContent', () => {
  it('removes average price rows without a calculable value', () => {
    const content = [
      '<ul>',
      '<li><strong>Average Price:</strong> $ / sq. ft.</li>',
      '<li><strong>Year Built:</strong> 1998</li>',
      '</ul>'
    ].join('')

    expect(sanitizeBuildingContent(content)).toBe(
      '<ul><li><strong>Year Built:</strong> 1998</li></ul>'
    )
  })

  it('keeps average price rows with a numeric value', () => {
    const content =
      '<p><strong>Average Price:</strong> $725 / sq. ft.</p>'

    expect(sanitizeBuildingContent(content)).toBe(content)
  })
})
