import { useRef, type ReactNode, type PointerEvent } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

interface Props {
  href: string
  variant?: 'metal' | 'ghost'
  size?: 'md' | 'sm'
  arrow?: boolean
  external?: boolean
  children: ReactNode
}

/** Pill link that leans toward the cursor (magnetic hover). */
export function Button({ href, variant = 'metal', size = 'md', arrow = false, external = false, children }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)

  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`
  }
  const leave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <a
      ref={ref}
      href={href}
      className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''}`.trim()}
      onPointerMove={move}
      onPointerLeave={leave}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
      {arrow && <span className="arr" aria-hidden="true">→</span>}
    </a>
  )
}
