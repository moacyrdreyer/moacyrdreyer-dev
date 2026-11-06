const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function frameIndex(progress: number, frameCount: number): number {
  return Math.round(clamp01(progress) * (frameCount - 1))
}

/** Closest frame for which `isLoaded` is true, preferring the earlier one on ties; -1 if none. */
export function nearestLoaded(i: number, isLoaded: (i: number) => boolean, frameCount: number): number {
  for (let d = 0; d < frameCount; d++) {
    if (i - d >= 0 && isLoaded(i - d)) return i - d
    if (i + d < frameCount && isLoaded(i + d)) return i + d
  }
  return -1
}

/** All frame indices ordered by distance from `start`, so the visible frame loads first. */
export function loadOrder(start: number, frameCount: number): number[] {
  return [...Array(frameCount).keys()].sort((a, b) => Math.abs(a - start) - Math.abs(b - start) || a - b)
}

/** 0 when the section's top hits the viewport top, 1 when its bottom reaches the viewport bottom. */
export function scrollProgress(rectTop: number, rectHeight: number, viewportHeight: number): number {
  const travel = rectHeight - viewportHeight
  if (travel <= 0) return rectTop < 0 ? 1 : 0
  return clamp01(-rectTop / travel)
}

export interface Fit { x: number; y: number; w: number; h: number }

/**
 * Landscape: cover the viewport (so the final frame fills it edge to edge).
 * Portrait (phones): scale to a bit wider than the viewport and place in the upper half,
 * leaving room for the headline below.
 */
export function fitFrame(vw: number, vh: number, iw: number, ih: number): Fit {
  if (vw >= vh) {
    const s = Math.max(vw / iw, vh / ih)
    const w = iw * s, h = ih * s
    return { x: (vw - w) / 2, y: (vh - h) / 2, w, h }
  }
  const w = vw * 1.2, h = w * (ih / iw)
  return { x: (vw - w) / 2, y: vh * 0.08, w, h }
}

/** The screen powers on during the last part of the lid opening. */
export function screenOpacity(lidOpen: number): number {
  return clamp01((lidOpen - 0.55) / 0.35)
}
