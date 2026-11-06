import { site } from '../data/site'
import { Button } from './ui/Button'
import { Reveal } from './ui/Reveal'
import { Scramble } from './ui/Scramble'

export function About() {
  const s = site.about
  return (
    <section className="sec" id="sobre">
      <div className="wrap ed">
        <Reveal className="ed-head">
          <Scramble text={s.label} />
          <h2>{s.title}</h2>
          <p>{s.text}</p>
          <figure className="about-photo">
            <picture>
              <source type="image/avif" srcSet={s.photo.avif} sizes="240px" />
              <source type="image/webp" srcSet={s.photo.webp} sizes="240px" />
              <img src={s.photo.src} alt={s.photo.alt} width={480} height={642} loading="lazy" decoding="async" />
            </picture>
          </figure>
        </Reveal>
        <div>
          <ul className="points">
            {s.points.map((pt, i) => (
              <Reveal as="li" key={pt.title} index={i}>
                <div>
                  <h3>{pt.title}</h3>
                  <p>{pt.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal className="about-cta">
            <Button href="#contato" arrow>{s.cta}</Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
