import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

const W = 200
const H = 92
const CUT = 66 // x where the laptop breaks apart
const SCREEN = { x: 14, y: 10, w: 72, h: 48 }

interface Shard { x: number; y: number; w: number; h: number; v: number; a: number; hi: boolean }

/** "Code" rows on the right: groups of short bars that read like indented lines. */
const CODE_ROWS = [
  [[0, 10], [13, 16], [32, 6]],
  [[6, 8], [17, 20]],
  [[6, 14], [23, 9], [35, 12]],
  [[0, 4]],
  [[0, 18], [21, 11]],
  [[6, 22]],
  [[0, 4]],
] as const

/**
 * Tiny footer piece: a line-drawn laptop whose right half dissolves into shards
 * that drift off and settle into lines of code. Silver on obsidian.
 */
export function CodeDissolve() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const reduced = prefersReducedMotion()
    const d = Math.min(devicePixelRatio || 1, 2)
    cv.width = W * d
    cv.height = H * d
    ctx.setTransform(d, 0, 0, d, 0, 0)

    const shards: Shard[] = []
    const spawn = (warm = false) => {
      const y = SCREEN.y + Math.random() * (SCREEN.h + 8)
      shards.push({
        x: CUT + (warm ? Math.random() * 120 : Math.random() * 4),
        y: Math.round(y),
        w: 2 + Math.random() * 12,
        h: Math.random() < 0.7 ? 1 : 2,
        v: 6 + Math.random() * 26,
        a: 0.35 + Math.random() * 0.6,
        hi: Math.random() < 0.18,
      })
    }
    for (let i = 0; i < 46; i++) spawn(true)

    const laptop = () => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, CUT, H)
      ctx.clip()
      // lid
      ctx.strokeStyle = 'rgba(217,221,226,.85)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(SCREEN.x + 0.5, SCREEN.y + 0.5, SCREEN.w, SCREEN.h, 3)
      ctx.stroke()
      // wallpaper swooshes
      ctx.strokeStyle = 'rgba(167,173,180,.55)'
      ctx.beginPath()
      ctx.moveTo(SCREEN.x + 4, SCREEN.y + 30)
      ctx.bezierCurveTo(30, 20, 46, 26, CUT, 38)
      ctx.moveTo(SCREEN.x + 18, SCREEN.y + SCREEN.h - 2)
      ctx.bezierCurveTo(34, 40, 50, 36, CUT, 44)
      ctx.stroke()
      // base
      ctx.strokeStyle = 'rgba(217,221,226,.85)'
      ctx.beginPath()
      ctx.moveTo(6, SCREEN.y + SCREEN.h + 4.5)
      ctx.lineTo(CUT + 30, SCREEN.y + SCREEN.h + 4.5)
      ctx.moveTo(8, SCREEN.y + SCREEN.h + 7.5)
      ctx.lineTo(CUT + 30, SCREEN.y + SCREEN.h + 7.5)
      ctx.stroke()
      ctx.restore()
    }

    const code = (t: number) => {
      CODE_ROWS.forEach((row, r) => {
        // each row fades in and out on its own rhythm
        const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + r * 0.9))
        row.forEach(([x, w], k) => {
          ctx.fillStyle = k === 0 && r % 3 === 0 ? `rgba(217,221,226,${a + 0.15})` : `rgba(167,173,180,${a})`
          ctx.fillRect(132 + x, 16 + r * 8, w, 2)
        })
      })
    }

    let raf = 0, last = performance.now(), t = 0, visible = false
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      ctx.clearRect(0, 0, W, H)
      laptop()

      // the seam glows and flickers a little
      const g = ctx.createLinearGradient(CUT - 6, 0, CUT + 6, 0)
      g.addColorStop(0, 'rgba(217,221,226,0)')
      g.addColorStop(0.5, `rgba(235,238,242,${0.55 + 0.25 * Math.sin(t * 7)})`)
      g.addColorStop(1, 'rgba(217,221,226,0)')
      ctx.fillStyle = g
      ctx.fillRect(CUT - 6, SCREEN.y - 2, 12, SCREEN.h + 12)

      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i]
        s.x += s.v * dt
        const fade = 1 - Math.min(1, (s.x - CUT) / 70)
        if (fade <= 0) {
          shards.splice(i, 1)
          continue
        }
        ctx.fillStyle = s.hi ? `rgba(245,247,250,${s.a * fade})` : `rgba(167,173,180,${s.a * fade})`
        ctx.fillRect(s.x, s.y, s.w, s.h)
      }
      while (shards.length < 46) spawn()
      code(t)

      ctx.fillStyle = 'rgba(167,173,180,.6)'
      ctx.font = '9px "IBM Plex Mono", monospace'
      ctx.fillText('</>', 176, 82)

      if (!reduced && visible) raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduced) {
        last = performance.now()
        raf = requestAnimationFrame(draw)
      }
    })
    io.observe(cv)
    draw(performance.now()) // first (and, with reduced motion, only) frame

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="dissolve" style={{ width: W, height: H }} aria-hidden="true" />
}
