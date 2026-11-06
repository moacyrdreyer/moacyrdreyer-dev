import { site } from '../data/site'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

export function Services() {
  const s = site.services
  return (
    <section className="sec" id="servicos">
      <div className="wrap ed">
        <Reveal className="ed-head">
          <Scramble text={s.label} />
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </Reveal>
        <ul className="svc">
          {s.items.map((it, i) => (
            <Reveal as="li" key={it.title} index={i}>
              <span className="n mono">{String.fromCharCode(65 + i)}</span>
              <div>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
                <ul className="tags">{it.tags.map(t => <li className="tag" key={t}>{t}</li>)}</ul>
              </div>
              <span className="go" aria-hidden="true">↗</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
