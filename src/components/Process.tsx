import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

/** Steps on a rail that draws itself as you scroll through the section. */
export function Process() {
  const s = site.process
  const listRef = useRef<HTMLOListElement>(null)
  const fillRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = listRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)))
      setProgress(p)
      if (fillRef.current) fillRef.current.style.transform = innerWidth > 900 ? `scaleX(${p})` : `scaleY(${p})`
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])

  const last = s.steps.length - 1
  return (
    <section className="sec" id="processo">
      <div className="wrap">
        <Reveal className="ed proc-head">
          <div><Scramble text={s.label} /><h2>{s.title}</h2></div>
          <p>{s.text}</p>
        </Reveal>
        <ol className="steps" ref={listRef}>
          <li className="rail" aria-hidden="true"><i ref={fillRef} /></li>
          {s.steps.map((st, i) => (
            <li className={`step ${progress >= i / last - 0.02 ? 'on' : ''}`} key={st.title}>
              <span className="dot" aria-hidden="true" />
              <div className="mono">Etapa {i + 1}</div>
              <h3>{st.title}</h3>
              <p>{st.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
