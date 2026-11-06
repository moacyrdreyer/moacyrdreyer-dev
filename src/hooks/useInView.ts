import { useEffect, useState, type RefObject } from 'react'

/** Becomes true once the element enters the viewport (never resets). */
export function useInView(ref: RefObject<Element | null>, threshold = 0.15): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold, inView])
  return inView
}
