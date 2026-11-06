import { useState } from 'react'
import { site } from '../data/site'
import { Button } from './ui/Button'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

export function Contact() {
  const s = site.contact
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${site.email}`
    }
  }
  const c = site.credit

  return (
    <section className="contact" id="contato">
      <div className="wrap">
        <Reveal><Scramble text={s.label} /></Reveal>
        <Reveal as="h2">{s.title} <span className="metal">{s.titleAccent}</span></Reveal>
        <Reveal className="contact-row">
          <div className="mail">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <button className="copybtn" type="button" onClick={copy} aria-live="polite">{copied ? 'Copiado ✓' : 'Copiar'}</button>
          </div>
          <div className="socials">
            <Button href={site.links.github} variant="ghost" external>GitHub</Button>
            {site.links.linkedin && <Button href={site.links.linkedin} variant="ghost" external>LinkedIn</Button>}
            <Button href={site.links.instagram} variant="ghost" external>Instagram</Button>
            {site.links.whatsapp && <Button href={`https://wa.me/${site.links.whatsapp}`} variant="ghost" external>WhatsApp</Button>}
            <Button href={`mailto:${site.email}`} arrow>Enviar e-mail</Button>
          </div>
        </Reveal>
        <footer className="mono">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Feito com React + Vite</span>
          <a href="#top">Voltar ao topo ↑</a>
          <span className="credit">
            Modelo 3D: “<a href={c.modelUrl} target="_blank" rel="noreferrer">{c.model}</a>” por{' '}
            <a href={c.authorUrl} target="_blank" rel="noreferrer">{c.author}</a>, licença{' '}
            <a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a>, modificado (logo removido, materiais e iluminação).
          </span>
        </footer>
      </div>
    </section>
  )
}
