import { Fragment, useEffect, useRef, useState } from 'react'
import { site } from '../../data/site'
import { scrollProgress } from '../../lib/sequence'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Button } from '../ui/Button'
import { Strata } from './Strata'

/** Progress shown when the user prefers reduced motion: lid open, laptop still at an angle. */
const STATIC_PROGRESS = 0.45

function hasWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

type GlState = 'loading' | 'ready' | 'off'

export function MacbookHero() {
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const glRef = useRef<HTMLCanvasElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLElement>(null)
  const smooth = useRef(reduced ? STATIC_PROGRESS : 0)
  const [gl, setGl] = useState<GlState>('loading')
  const [pct, setPct] = useState(0)

  const readProgress = () => {
    if (reduced) return STATIC_PROGRESS
    const el = sectionRef.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    return scrollProgress(r.top, r.height, window.innerHeight)
  }

  // scroll smoothing + headline fade (independent of WebGL)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      smooth.current += (readProgress() - smooth.current) * (reduced ? 1 : 0.12)
      const p = smooth.current
      const fade = reduced ? 0 : Math.min(1, p / 0.22)
      const copy = copyRef.current
      if (copy) {
        copy.style.opacity = String(1 - fade)
        copy.style.transform = `translateY(${-fade * 40}px)`
        copy.style.visibility = fade >= 1 ? 'hidden' : 'visible'
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - fade)
      if (progRef.current) {
        progRef.current.style.transform = `scaleX(${reduced ? 0 : p})`
        progRef.current.parentElement!.style.opacity = String(p > 0.9 ? 1 - (p - 0.9) / 0.1 : 1)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // readProgress only depends on `reduced`
  }, [reduced]) // eslint-disable-line react-hooks/exhaustive-deps

  // the 3D scene is a separate chunk, fetched after the page is up
  useEffect(() => {
    const canvas = glRef.current
    if (!canvas || !hasWebGL()) {
      setGl('off')
      return
    }
    let disposed = false
    let dispose: (() => void) | undefined
    Promise.all([
      import('./macbookScene'),
      document.fonts?.load('500 30px "IBM Plex Mono"').catch(() => null),
      document.fonts?.load('500 120px "Geist Variable"').catch(() => null),
    ])
      .then(([mod]) => {
        if (disposed) return
        const scene = mod.createMacbookScene(canvas, {
          progress: () => smooth.current,
          reduced,
          onLoad: () => !disposed && setGl('ready'),
          onProgress: n => !disposed && setPct(n),
          onError: () => !disposed && setGl('off'),
        })
        dispose = scene.dispose
      })
      .catch(() => !disposed && setGl('off'))
    return () => {
      disposed = true
      dispose?.()
    }
  }, [reduced])

  const words = site.hero.title.split(' ')
  const accent = site.hero.titleAccent.split(' ')
  let w = 0
  // the space must sit outside the clipped .w box, or the browser drops it
  const word = (text: string, metal: boolean) => (
    <Fragment key={`${text}-${w}`}>
      <span className="w">
        <span className={metal ? 'metal' : undefined} style={{ transitionDelay: `${0.15 + w++ * 0.12}s` }}>{text}</span>
      </span>{' '}
    </Fragment>
  )

  return (
    <section className="scrolly" id="top" ref={sectionRef} aria-label="Apresentação">
      <div className={`stage gl-${gl}`}>
        <Strata progress={smooth} />
        {/* rendered still: shown while the model loads, and kept if WebGL isn't available */}
        <picture>
          <source media="(max-aspect-ratio: 1/1)" srcSet="/3d/poster-portrait.webp" />
          <img className="poster" src="/3d/poster.webp" alt="" aria-hidden="true" width={1600} height={1000} fetchPriority="high" />
        </picture>
        <canvas className="gl" ref={glRef} aria-label="MacBook 3D interativo: arraste para girar e role para abrir" role="img" />
        <div className="hprog" aria-hidden="true"><i ref={progRef} /></div>

        <div className="hero-copy" ref={copyRef}>
          <div className="wrap">
            <div className="inner">
              {site.available && (
                <div className="status mono fade-up" style={{ transitionDelay: '.1s' }}><b />{site.hero.status}</div>
              )}
              <h1 className="name" aria-label={`${site.hero.title} ${site.hero.titleAccent}`}>
                <span aria-hidden="true">
                  {words.map(t => word(t, false))}
                  <br />
                  {accent.map(t => word(t, true))}
                </span>
              </h1>
              <p className="fade-up" style={{ transitionDelay: '.7s' }}>{site.hero.lead}</p>
              <div className="ctas fade-up" style={{ transitionDelay: '.85s' }}>
                <Button href={site.hero.primary.href} arrow>{site.hero.primary.label}</Button>
                <Button href={site.hero.secondary.href} variant="ghost">{site.hero.secondary.label}</Button>
              </div>
            </div>
          </div>
        </div>
        {!reduced && (
          <div className="hint mono" ref={hintRef} aria-hidden="true">
            <span />
            {gl === 'loading' ? `Carregando 3D ${pct}%` : gl === 'ready' ? 'Arraste o notebook · role para abrir' : 'Role para continuar'}
          </div>
        )}
      </div>
    </section>
  )
}
