import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

interface Props {
  as?: ElementType
  className?: string
  /** Position in a staggered group; each step adds 90ms. */
  index?: number
  onReveal?: () => void
  children?: ReactNode
  [key: string]: unknown
}

/** Fades and lifts its content in when it scrolls into view. */
export function Reveal({ as: Tag = 'div', className = '', index = 0, onReveal, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const fired = useRef(false)

  useEffect(() => {
    if (inView && !fired.current) {
      fired.current = true
      onReveal?.()
    }
  }, [inView, onReveal])

  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`.trim()} style={{ transitionDelay: `${index * 0.09}s` }} {...rest}>
      {children}
    </Tag>
  )
}
