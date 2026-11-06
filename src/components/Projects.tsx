import { useState } from 'react'
import { site } from '../data/site'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

const BARS = [38, 52, 46, 61, 58, 72, 69, 84, 80, 94]

function SiteMock() {
  return (
    <div className="m-site">
      <div>
        <div className="t1" /><div className="t2" />
        <div className="t3" /><div className="t3" style={{ width: '90%' }} /><div className="t3" style={{ width: '70%' }} />
        <div className="pill" />
      </div>
      <div className="img" />
    </div>
  )
}

function DashMock({ grow }: { grow: boolean }) {
  return (
    <div className="m-dash">
      <div className="side"><i /><i /><i /><i /><i /></div>
      <div className="main">
        <div className="kpis">
          <div className="kpi"><small>Receita</small><b>R$ ••,•k</b></div>
          <div className="kpi"><small>Assinaturas</small><b>•••</b></div>
          <div className="kpi"><small>Inadimplência</small><b>•,•%</b></div>
        </div>
        <div className="chart">
          {BARS.map((h, k) => <i key={k} style={{ height: grow ? `${h}%` : 0, transitionDelay: `${0.3 + k * 0.07}s` }} />)}
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const s = site.projects
  const [grow, setGrow] = useState(false)
  return (
    <section className="sec" id="projetos">
      <div className="wrap ed">
        <Reveal className="ed-head">
          <Scramble text={s.label} />
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </Reveal>
        <div className="projects">
          {s.items.map((p, i) => (
            <Reveal as="article" className="proj" key={p.name} index={i} onReveal={p.mock === 'dashboard' ? () => setGrow(true) : undefined}>
              <div className="proj-vis" aria-hidden="true">
                <div className="browser">
                  <div className="bar"><i /><i /><i /><span>{p.urlLabel}</span></div>
                  {p.mock === 'site' ? <SiteMock /> : <DashMock grow={grow} />}
                </div>
              </div>
              <div className="proj-body">
                <div>
                  <div className="cat mono">{p.category}</div>
                  <h3>{p.name}</h3>
                  <p>{p.text}</p>
                  <ul className="tags">{p.tags.map(t => <li className="tag" key={t}>{t}</li>)}</ul>
                </div>
                {p.url ? (
                  <a className="proj-link" href={p.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${p.urlLabel}`}>↗</a>
                ) : (
                  <span className="proj-link" aria-hidden="true">↗</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
