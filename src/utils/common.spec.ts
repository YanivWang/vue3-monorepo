import { describe, it, expect } from 'vitest'
import { formatDate } from './common'

describe('formatDate', () => {
  it('formats known date', () => {
    expect(formatDate('2025-01-15')).toBe('2025-01-15')
  })
})
