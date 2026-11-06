/** Four points: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [[number, number], [number, number], [number, number], [number, number]]

/** Gaussian elimination with partial pivoting. Mutates its inputs. */
function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length
  for (let i = 0; i < n; i++) {
    let max = i
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[max][i])) max = r
    ;[A[i], A[max]] = [A[max], A[i]]
    ;[b[i], b[max]] = [b[max], b[i]]
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i]
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]
      b[r] -= f * b[i]
    }
  }
  const x = new Array<number>(n)
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i]
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]
    x[i] = s / A[i][i]
  }
  return x
}

/**
 * Projective transform taking the rectangle (0,0)-(w,h) onto `dst`.
 * Returns [a, b, c, d, e, f, g, h] for: u = (ax + by + c) / (gx + hy + 1), v = (dx + ey + f) / (gx + hy + 1).
 */
export function solveHomography(w: number, h: number, dst: Quad): number[] {
  const src: Quad = [[0, 0], [w, 0], [w, h], [0, h]]
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]
    const [u, v] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v)
  }
  return solveLinear(A, b)
}

export function applyHomography(H: number[], [x, y]: [number, number]): [number, number] {
  const [a, b, c, d, e, f, g, h] = H
  const z = g * x + h * y + 1
  return [(a * x + b * y + c) / z, (d * x + e * y + f) / z]
}

/** CSS `matrix3d()` that maps a w×h element (transform-origin 0 0) onto `dst`. */
export function homographyMatrix3d(w: number, h: number, dst: Quad): string {
  const [a, b, c, d, e, f, g, hh] = solveHomography(w, h, dst)
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`
}
