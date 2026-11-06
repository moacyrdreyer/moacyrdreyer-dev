import { fitFrame, frameIndex, loadOrder, nearestLoaded, scrollProgress, screenOpacity } from './sequence'

describe('frameIndex', () => {
  it('maps progress 0..1 onto 0..n-1 and clamps', () => {
    expect(frameIndex(0, 90)).toBe(0)
    expect(frameIndex(1, 90)).toBe(89)
    expect(frameIndex(0.5, 91)).toBe(45)
    expect(frameIndex(-0.2, 90)).toBe(0)
    expect(frameIndex(1.4, 90)).toBe(89)
  })
})

describe('nearestLoaded', () => {
  it('returns the index itself when loaded', () => {
    expect(nearestLoaded(5, i => i === 5, 10)).toBe(5)
  })
  it('walks outward, preferring the earlier frame on ties', () => {
    expect(nearestLoaded(5, i => i === 3 || i === 7, 10)).toBe(3)
    expect(nearestLoaded(5, i => i === 8, 10)).toBe(8)
  })
  it('returns -1 when nothing is loaded', () => {
    expect(nearestLoaded(2, () => false, 10)).toBe(-1)
  })
})

describe('loadOrder', () => {
  it('starts at the current frame and fans out', () => {
    expect(loadOrder(2, 6)).toEqual([2, 1, 3, 0, 4, 5])
  })
})

describe('scrollProgress', () => {
  it('is 0 at the top, 1 when the section has fully scrolled, clamped', () => {
    expect(scrollProgress(0, 4000, 1000)).toBe(0)
    expect(scrollProgress(-1500, 4000, 1000)).toBe(0.5)
    expect(scrollProgress(-3000, 4000, 1000)).toBe(1)
    expect(scrollProgress(200, 4000, 1000)).toBe(0)
    expect(scrollProgress(-5000, 4000, 1000)).toBe(1)
  })
  it('guards against a section no taller than the viewport', () => {
    expect(scrollProgress(-10, 900, 1000)).toBe(1)
  })
})

describe('fitFrame', () => {
  it('covers landscape viewports (frame may overflow, stays centred)', () => {
    const f = fitFrame(1440, 900, 1600, 1000)
    expect(f.w / f.h).toBeCloseTo(1.6)
    expect(f.w).toBeGreaterThanOrEqual(1440)
    expect(f.h).toBeGreaterThanOrEqual(900)
    expect(f.x).toBeCloseTo((1440 - f.w) / 2)
  })
  it('fits width on portrait viewports and sits in the upper part', () => {
    const f = fitFrame(390, 844, 960, 600)
    expect(f.w).toBeCloseTo(390 * 1.35)
    expect(f.x).toBeCloseTo((390 - f.w) / 2)
    expect(f.y).toBeGreaterThan(0)
    expect(f.y + f.h).toBeLessThan(844)
  })
})

describe('screenOpacity', () => {
  it('stays off until the lid is mostly open, then ramps to 1', () => {
    expect(screenOpacity(0)).toBe(0)
    expect(screenOpacity(0.55)).toBe(0)
    expect(screenOpacity(0.725)).toBeCloseTo(0.5)
    expect(screenOpacity(1)).toBe(1)
  })
})
