import { useCallback, useState } from 'react'
import { codeTokens, site } from '../data/site'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'
import { TypedCode } from './ui/TypedCode'

export function Showcase() {
  const s = site.showcase
  const [typing, setTyping] = useState(false)
  const [lines, setLines] = useState(0)

  const start = useCallback(() => setTyping(true), [])
  const done = useCallback(() => {
    s.terminal.forEach((_, k) => setTimeout(() => setLines(k + 1), k * (k === 3 ? 700 : 420)))
  }, [s.terminal])

  return (
    <section className="showcase" id="vitrine">
      <div className="wrap">
        <Reveal className="show-head">
          <div><Scramble text={s.label} /><h2>{s.title}</h2></div>
          <p>{s.text}</p>
        </Reveal>
        <Reveal className="show-grid" onReveal={start}>
          <div className="panel">
            <div className="panel-bar mono"><i /><i /><i /><span className="tab">{s.file}</span></div>
            <TypedCode tokens={codeTokens} start={typing} className="code" onDone={done} />
          </div>
          <div className="panel">
            <div className="panel-bar mono"><i /><i /><i /><span className="tab">terminal</span></div>
            <ul className="term" aria-label="Saída do terminal">
              {s.terminal.map((l, k) => (
                <li key={k} className={k < lines ? 'on' : ''}>
                  {l.kind === 'cmd' && <><span className="hi">$</span> {l.text}</>}
                  {l.kind === 'ok' && <><span className="ok">✓</span> {l.text} {'note' in l && <span className="t-c">{l.note}</span>}{'strong' in l && <span className="hi">{l.strong}</span>}</>}
                  {l.kind === 'info' && l.text}
                </li>
              ))}
              <li className={lines >= s.terminal.length ? 'on' : ''}><span className="hi">$</span> <span className="caret" /></li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
