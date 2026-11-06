import { useEffect, useRef, type RefObject } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

/** Slowly drifting geological contour lines behind the laptop. Fades as the camera dives in. */
export function Strata({ progress }: { progress: RefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const reduced = prefersReducedMotion()
    let W = 0, H = 0, t = 0, raf = 0, visible = true

    const resize = () => {
      const d = Math.min(devicePixelRatio || 1, 2)
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = W * d
      cv.height = H * d
      ctx.setTransform(d, 0, 0, d, 0, 0)
    }
    resize()
    addEventListener('resize', resize)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(cv)

    const N = 30
    const draw = () => {
      const p = progress.current ?? 0
      if (visible && p < 0.999) {
        ctx.clearRect(0, 0, W, H)
        for (let k = 0; k < N; k++) {
          const q = k / (N - 1)
          const base = H * (0.05 + q * 0.95)
          const amp = 14 + 22 * Math.sin(q * Math.PI)
          ctx.beginPath()
          for (let x = -20; x <= W + 20; x += 16) {
            const y = base + Math.sin(x * 0.004 + t * 0.6 + k * 0.32) * amp + Math.sin(x * 0.011 - t * 0.35 + k * 0.7) * amp * 0.3
            if (x === -20) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.strokeStyle = `rgba(196,200,206,${(0.035 + 0.09 * Math.sin(q * Math.PI)) * (1 - p * 0.8)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
        if (!reduced) t += 0.005
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      io.disconnect()
    }
  }, [progress])

  return <canvas ref={ref} className="strata" aria-hidden="true" />
}
