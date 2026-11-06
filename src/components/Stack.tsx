import { site } from '../data/site'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className={`marquee ${reverse ? 'rev' : ''}`} aria-hidden="true">
      <ul className="track">{items.map(t => <li key={t}>{t}</li>)}</ul>
      <ul className="track">{items.map(t => <li key={t}>{t}</li>)}</ul>
    </div>
  )
}

export function Stack() {
  const s = site.stack
  return (
    <section className="band dark" id="stack">
      <Reveal className="wrap head">
        <Scramble text={s.label} />
        <h2>{s.title}</h2>
      </Reveal>
      <Marquee items={s.rowA} />
      <Marquee items={s.rowB} reverse />
      <div className="wrap">
        <div className="groups">
          {s.groups.map((g, i) => (
            <Reveal className="grp" key={g.title} index={i}>
              <div className="mono">{g.title}</div>
              <p>{g.items}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
