import { useEffect, useRef, useState } from 'react'
import type { Quad } from '../../lib/homography'
import { frameIndex, loadOrder } from '../../lib/sequence'

export interface SeqMeta {
  frames: number
  width: number
  height: number
  /** Per frame: screen corners (0..1, TL TR BR BL) and how open the lid is (0..1). */
  corners: { c: Quad; open: number }[]
}

export type Frame = ImageBitmap | HTMLImageElement

const CONCURRENCY = 6

async function decode(url: string): Promise<Frame> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const blob = await res.blob()
  if ('createImageBitmap' in window) return createImageBitmap(blob)
  const img = new Image()
  img.src = URL.createObjectURL(blob)
  await img.decode()
  return img
}

/**
 * Loads the rendered MacBook frames for `set`, starting with the frame for the current
 * scroll position and fanning out, so whatever is on screen appears first.
 */
export function useFrameSequence(set: 'desktop' | 'mobile', getProgress: () => number) {
  const meta = useRef<SeqMeta | null>(null)
  const frames = useRef<(Frame | undefined)[]>([])
  const [ready, setReady] = useState(false)
  const progressRef = useRef(getProgress)
  progressRef.current = getProgress

  useEffect(() => {
    let cancelled = false
    const base = `/seq/${set}`

    ;(async () => {
      const m = (await (await fetch(`${base}/screen.json`)).json()) as SeqMeta
      if (cancelled) return
      meta.current = m
      frames.current = new Array(m.frames)
      const order = loadOrder(frameIndex(progressRef.current(), m.frames), m.frames)
      const load = async (i: number) => {
        const f = await decode(`${base}/f_${String(i + 1).padStart(4, '0')}.webp`)
        if (cancelled) {
          if ('close' in f) f.close()
          return
        }
        frames.current[i] = f
      }
      await load(order[0])
      if (cancelled) return
      setReady(true)
      let k = 1
      const worker = async () => {
        while (!cancelled && k < order.length) {
          const i = order[k++]
          await load(i).catch(() => undefined)
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    })().catch(() => undefined)

    return () => {
      cancelled = true
      frames.current.forEach(f => f && 'close' in f && f.close())
      frames.current = []
      meta.current = null
    }
  }, [set])

  return { meta, frames, ready }
}
