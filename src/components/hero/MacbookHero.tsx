import { useEffect, useRef, useState } from 'react'
import { site } from '../../data/site'
import { homographyMatrix3d, type Quad } from '../../lib/homography'
import { fitFrame, frameIndex, nearestLoaded, screenOpacity, scrollProgress, type Fit } from '../../lib/sequence'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Button } from '../ui/Button'
import { ScreenOS } from './ScreenOS'
import { Strata } from './Strata'
import { useFrameSequence } from './useFrameSequence'

/** Progress shown when the user prefers reduced motion: lid open, laptop still at an angle. */
const STATIC_PROGRESS = 0.45
/** Past this progress the screen shows the editor instead of the boot splash. */
const IDE_FROM = 0.62

function pickSet(): 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop'
  return Math.min(window.innerWidth, window.innerHeight) < 700 ? 'mobile' : 'desktop'
}

export function MacbookHero() {
  const reduced = useReducedMotion()
  const [set] = useState(pickSet)

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLElement>(null)

  const smooth = useRef(reduced ? STATIC_PROGRESS : 0)
  const target = useRef(0)
  const readProgress = () => {
    if (reduced) return STATIC_PROGRESS
    const el = sectionRef.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    return scrollProgress(r.top, r.height, window.innerHeight)
  }

  const { meta, frames } = useFrameSequence(set, readProgress)
  const [phase, setPhase] = useState<'boot' | 'ide'>('boot')
  const phaseRef = useRef(phase)

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !stage || !ctx) return

    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false
    let dpr = 1, VW = 0, VH = 0, fit: Fit | null = null, drawn = -1, raf = 0
    let mx = 0, my = 0, tx = 0, ty = 0

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      VW = stage.clientWidth
      VH = stage.clientHeight
      canvas.width = VW * dpr
      canvas.height = VH * dpr
      fit = null
      drawn = -1
    }
    resize()
    const onPointer = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5
      ty = e.clientY / window.innerHeight - 0.5
    }
    addEventListener('resize', resize)
    if (finePointer && !reduced) addEventListener('pointermove', onPointer)

    const loop = () => {
      target.current = readProgress()
      smooth.current += (target.current - smooth.current) * (reduced ? 1 : 0.14)
      const p = smooth.current
      mx += (tx - mx) * 0.06
      my += (ty - my) * 0.06

      const m = meta.current
      if (m) {
        if (!fit) fit = fitFrame(VW, VH, m.width, m.height)
        const f = fit
        const i = nearestLoaded(frameIndex(p, m.frames), j => !!frames.current[j], m.frames)
        if (i >= 0) {
          if (i !== drawn) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, VW, VH)
            ctx.drawImage(frames.current[i]!, f.x, f.y, f.w, f.h)
            drawn = i
          }
          const c = m.corners[i]
          const quad = c.c.map(([x, y]) => [f.x + x * f.w, f.y + y * f.h]) as Quad
          const screen = screenRef.current
          if (screen) {
            screen.style.transform = homographyMatrix3d(1440, 900, quad)
            screen.style.opacity = String(screenOpacity(c.open))
          }
        }
      }
      // in the last stretch the screen fills the view: drop the laptop so only the "display" remains
      canvas.style.opacity = String(p > 0.9 ? Math.max(0, 1 - (p - 0.9) / 0.1) : 1)

      const nextPhase = p < IDE_FROM ? 'boot' : 'ide'
      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase
        setPhase(nextPhase)
      }

      const fade = reduced ? 0 : Math.min(1, p / 0.22)
      const copy = copyRef.current
      if (copy) {
        copy.style.opacity = String(1 - fade)
        copy.style.transform = `translateY(${-fade * 40}px)`
        copy.style.visibility = fade >= 1 ? 'hidden' : 'visible'
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - fade)
      if (progRef.current) progRef.current.style.transform = `scaleX(${reduced ? 0 : p})`

      const k = finePointer && !reduced ? 1 - p : 0
      if (tiltRef.current) tiltRef.current.style.transform = `rotateY(${mx * 5 * k}deg) rotateX(${-my * 3.5 * k}deg) translate3d(${mx * -14 * k}px, ${my * -10 * k}px, 0)`
      if (glareRef.current) {
        glareRef.current.style.setProperty('--gx', `${50 + mx * 80}%`)
        glareRef.current.style.setProperty('--gy', `${40 + my * 60}%`)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onPointer)
    }
    // readProgress only depends on `reduced`; meta/frames are stable refs
  }, [reduced, meta, frames])

  const words = site.hero.title.split(' ')
  const accent = site.hero.titleAccent.split(' ')
  let w = 0
  const word = (text: string, metal: boolean) => (
    <span className="w" key={`${text}-${w}`}>
      <span className={metal ? 'metal' : undefined} style={{ transitionDelay: `${0.15 + w++ * 0.09}s` }}>{text}</span>{' '}
    </span>
  )

  return (
    <section className="scrolly" id="top" ref={sectionRef} aria-label="Apresentação">
      <div className="stage" ref={stageRef}>
        <Strata progress={smooth} />
        <div className="tilt" ref={tiltRef}>
          <canvas className="seq" ref={canvasRef} aria-hidden="true" />
          <div className="screen" ref={screenRef} aria-hidden="true">
            <ScreenOS phase={phase} />
          </div>
          <div className="glare" ref={glareRef} />
        </div>
        <div className="hprog" aria-hidden="true"><i ref={progRef} /></div>

        <div className="hero-copy" ref={copyRef}>
          <div className="wrap">
            <div className="inner">
              {site.available && (
                <div className="status mono fade-up" style={{ transitionDelay: '.1s' }}><b />{site.hero.status}</div>
              )}
              <h1 aria-label={`${site.hero.title} ${site.hero.titleAccent}`}>
                <span aria-hidden="true">
                  {words.map(t => word(t, false))}
                  <br />
                  {accent.map(t => word(t, true))}
                </span>
              </h1>
              <p className="fade-up" style={{ transitionDelay: '.9s' }}>{site.hero.lead}</p>
              <div className="ctas fade-up" style={{ transitionDelay: '1.05s' }}>
                <Button href={site.hero.primary.href} arrow>{site.hero.primary.label}</Button>
                <Button href={site.hero.secondary.href} variant="ghost">{site.hero.secondary.label}</Button>
              </div>
            </div>
          </div>
        </div>
        {!reduced && <div className="hint mono" ref={hintRef} aria-hidden="true"><span />Role para abrir</div>}
      </div>
    </section>
  )
}
