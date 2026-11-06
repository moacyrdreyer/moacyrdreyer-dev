import { useEffect, useState } from 'react'
import { site } from '../data/site'
import { Button } from './ui/Button'

/** Fixed top bar; turns translucent after scrolling. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`} aria-label="Principal">
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
