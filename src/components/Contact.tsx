import { site } from '../data/site'
import { Button } from './ui/Button'
import { CodeDissolve } from './ui/CodeDissolve'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

export function Contact() {
  const s = site.contact
  const c = site.credit

  return (
    <section className="contact" id="contato">
      <div className="wrap">
        <Reveal><Scramble text={s.label} /></Reveal>
        <Reveal as="h2">{s.title} <span className="metal">{s.titleAccent}</span></Reveal>
        <Reveal className="contact-row">
          <div className="contact-cta">
            <p>{s.text}</p>
            <Button href={`mailto:${site.email}`} arrow>{s.cta}</Button>
          </div>
          <div className="socials">
            <Button href={site.links.github} variant="ghost" external>GitHub</Button>
            {site.links.linkedin && <Button href={site.links.linkedin} variant="ghost" external>LinkedIn</Button>}
            <Button href={site.links.instagram} variant="ghost" external>Instagram</Button>
            {site.links.whatsapp && <Button href={`https://wa.me/${site.links.whatsapp}`} variant="ghost" external>WhatsApp</Button>}
          </div>
        </Reveal>
        <footer className="mono">
          <CodeDissolve />
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span className="made">Feito à base de bastante café com código <b aria-hidden="true">&lt;/&gt;</b></span>
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
