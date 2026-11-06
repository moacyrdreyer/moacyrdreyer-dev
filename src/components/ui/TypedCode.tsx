import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

interface Props {
  tokens: [string, string][]
  start: boolean
  className?: string
  onDone?: () => void
}

/** Types syntax-highlighted code character by character once `start` turns true. */
export function TypedCode({ tokens, start, className, onDone }: Props) {
  const total = tokens.reduce((n, [s]) => n + s.length, 0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    if (prefersReducedMotion()) {
      setCount(total)
      return
    }
    let n = 0
    let timer = 0
    const flat = tokens.map(([s]) => s).join('')
    const step = () => {
      n++
      setCount(n)
      if (n < total) timer = window.setTimeout(step, flat[n - 1] === '\n' ? 90 : 16 + Math.random() * 28)
    }
    step()
    return () => window.clearTimeout(timer)
  }, [start, tokens, total])

  useEffect(() => {
    if (start && count >= total) onDone?.()
  }, [start, count, total, onDone])

  let left = count
  return (
    <pre className={className} aria-label={tokens.map(([s]) => s).join('')}>
      <span aria-hidden="true">
        {tokens.map(([s, cls], i) => {
          if (left <= 0) return null
          const part = s.slice(0, left)
          left -= part.length
          return <span key={i} className={cls}>{part}</span>
        })}
        {start && <span className="caret" />}
      </span>
    </pre>
  )
}
