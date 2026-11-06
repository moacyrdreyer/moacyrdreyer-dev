import { useEffect, useState } from 'react'
import { site } from '../data/site'
import { Button } from './ui/Button'

/** Fixed top bar; turns translucent after scrolling and switches to dark text over light sections. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [light, setLight] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const lights = document.querySelectorAll('.light-sec')
      setLight([...lights].some(s => {
        const r = s.getBoundingClientRect()
        return r.top <= 32 && r.bottom >= 32
      }))
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''} ${light ? 'light' : ''}`} aria-label="Principal">
      <div className="wrap">
        <a href="#top" className="logo">{site.name}<i /></a>
        <ul>
          {site.nav.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
        </ul>
        <Button href="#contato" size="sm">Vamos conversar</Button>
      </div>
    </nav>
  )
}
