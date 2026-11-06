import { useEffect, useState } from 'react'
import { site } from '../data/site'
import { fetchPublicRepoCount } from '../lib/github'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

/** One card that sends visitors to the GitHub repositories tab, with the live public repo count. */
export function OpenSource() {
  const s = site.openSource
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetchPublicRepoCount(site.githubUser).then(n => alive && setCount(n))
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="sec" id="codigo">
      <div className="wrap ed">
        <Reveal className="ed-head">
          <Scramble text={s.label} />
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </Reveal>
        <Reveal as="a" className="oss" href={s.url} target="_blank" rel="noreferrer" aria-label={`${s.cta} no GitHub (abre em nova aba)`}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="oss-count">{count ?? 'GitHub'}</div>
            <div className="oss-meta mono">{count !== null ? 'repositórios públicos' : s.cta}</div>
            <span className="oss-url">github.com/{site.githubUser}</span>
          </div>
          <span className="arrow" aria-hidden="true">↗</span>
        </Reveal>
      </div>
    </section>
  )
}
