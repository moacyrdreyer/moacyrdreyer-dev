import { useEffect, useState } from 'react'
import { codeTokens, site } from '../../data/site'
import { TypedCode } from '../ui/TypedCode'

const time = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** What the laptop "displays": a boot splash, then an editor typing code. Rendered at 1440×900. */
export function ScreenOS({ phase }: { phase: 'boot' | 'ide' }) {
  const [clock, setClock] = useState(time)
  useEffect(() => {
    const id = setInterval(() => setClock(time()), 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="os">
      <div className="os-menubar">
        <span><b>{site.name}</b>&nbsp;&nbsp; Arquivo &nbsp; Editar &nbsp; Ver</span>
        <span>{clock}</span>
      </div>
      <div className="os-notch" />
      <div className="os-boot" style={{ opacity: phase === 'boot' ? 1 : 0 }}>
        <h3>{site.name}<i /></h3>
      </div>
      <div className="os-ide" style={{ opacity: phase === 'ide' ? 1 : 0 }}>
        <div className="bar"><b /><b /><b /><span>{site.showcase.file}</span></div>
        <TypedCode tokens={codeTokens} start={phase === 'ide'} />
      </div>
    </div>
  )
}
