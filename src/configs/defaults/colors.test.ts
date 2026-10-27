import { background, hint, placeholder, white } from './colors'

// WCAG 2.x relative luminance and contrast ratio (1.4.3 needs 4.5:1 for
// normal text). Audit RT06 measured the search placeholder at 2.26:1 and
// the chart caption at 2.95:1.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const contrast = (fg: string, bg: string) => {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

describe('shared text colours', () => {
  it('hint and placeholder text meet 4.5:1 on white and on the page background', () => {
    expect(contrast(hint, white)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(hint, background)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(placeholder, white)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(placeholder, background)).toBeGreaterThanOrEqual(4.5)
  })
})
