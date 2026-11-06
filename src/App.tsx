import { useEffect } from 'react'
import { Contact } from './components/Contact'
import { MacbookHero } from './components/hero/MacbookHero'
import { Nav } from './components/Nav'
import { OpenSource } from './components/OpenSource'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { Services } from './components/Services'
import { Showcase } from './components/Showcase'
import { Stack } from './components/Stack'

export default function App() {
  // trigger the hero's entrance animations after the first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <a className="skip" href="#vitrine">Pular para o conteúdo</a>
      <Nav />
      <main>
        <MacbookHero />
        <Showcase />
        <div className="light-sec">
          <Services />
          <Projects />
          <OpenSource />
        </div>
        <Stack />
        <div className="light-sec">
          <Process />
        </div>
        <Contact />
      </main>
    </>
  )
}
