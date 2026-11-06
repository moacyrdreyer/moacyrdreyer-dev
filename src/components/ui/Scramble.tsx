import { useEffect, useRef, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

const GLYPHS = '01_/<>#*+='

/** Section label that resolves from random glyphs, left to right, when it first appears. */
export function Scramble({ text, className = 'num mono' }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, 0.5)
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    let frame = 0
    let raf = 0
    const tick = () => {
      setShown(text.split('').map((c, i) => (c === ' ' || i < frame / 2 ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''))
      if (++frame < text.length * 2 + 2) raf = requestAnimationFrame(tick)
      else setShown(text)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [inView, text])

  return (
    <div ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </div>
  )
}
