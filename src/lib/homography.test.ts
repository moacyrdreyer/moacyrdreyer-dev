import { applyHomography, homographyMatrix3d, solveHomography, type Quad } from './homography'

const rect = (w: number, h: number): Quad => [[0, 0], [w, 0], [w, h], [0, h]]

describe('solveHomography', () => {
  it('maps every source corner onto its destination corner', () => {
    const dst: Quad = [[120, 80], [900, 60], [940, 610], [100, 560]]
    const H = solveHomography(1440, 900, dst)
    rect(1440, 900).forEach((p, i) => {
      const [x, y] = applyHomography(H, p)
      expect(x).toBeCloseTo(dst[i][0], 6)
      expect(y).toBeCloseTo(dst[i][1], 6)
    })
  })

  it('is the identity when destination equals the source rectangle', () => {
    const H = solveHomography(200, 100, rect(200, 100))
    expect(H.map(v => Math.round(v * 1e6) / 1e6)).toEqual([1, 0, 0, 0, 1, 0, 0, 0])
  })
})

describe('homographyMatrix3d', () => {
  it('returns a CSS matrix3d with translation in the last row', () => {
    const css = homographyMatrix3d(100, 50, [[10, 20], [110, 20], [110, 70], [10, 70]])
    const nums = css.slice('matrix3d('.length, -1).split(',').map(Number)
    expect(nums).toHaveLength(16)
    expect(nums[0]).toBeCloseTo(1)
    expect(nums[5]).toBeCloseTo(1)
    expect(nums[12]).toBeCloseTo(10)
    expect(nums[13]).toBeCloseTo(20)
    expect(nums[15]).toBe(1)
  })
})
