import { describe, expect, it } from 'vitest'

import { parseEuroToCents } from '../format'

describe('parseEuroToCents', () => {
  it.each([
    ['4,50', 450],
    ['4.50', 450],
    ['0,5', 50],
    ['12', 1200],
    [' 180,00 € ', 18000],
    ['0,07', 7],
  ])('wandelt „%s“ in %i Cent um', (input, cents) => {
    expect(parseEuroToCents(input)).toBe(cents)
  })

  it.each(['', 'abc', '4,505', '-3', '1.234,56'])('lehnt „%s“ ab', (input) => {
    expect(parseEuroToCents(input)).toBeNull()
  })
})
