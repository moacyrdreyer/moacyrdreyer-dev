import { render, screen, within } from '@testing-library/react'
import App from './App'
import { site } from './data/site'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline in tests'))))
})
afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('renders the hero headline and main calls to action', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: `${site.hero.title} ${site.hero.titleAccent}` })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Iniciar projeto/ })).toHaveAttribute('href', '#contato')
  })

  it('keeps the spaces between headline words', () => {
    render(<App />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent?.replace(/\s+/g, ' ').trim()).toBe(`${site.hero.title} ${site.hero.titleAccent}`)
    // each word box must not swallow the space that follows it
    h1.querySelectorAll('.w').forEach(w => expect(w.textContent).not.toMatch(/\s$/))
  })

  it('has every section the nav points to', () => {
    const { container } = render(<App />)
    for (const item of site.nav) expect(container.querySelector(item.href)).not.toBeNull()
  })

  it('shows open source as a single card linking to the GitHub repositories tab', () => {
    render(<App />)
    const section = document.getElementById('codigo')!
    const links = within(section).getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', 'https://github.com/moacyrdreyer?tab=repositories')
    expect(links[0]).toHaveAttribute('target', '_blank')
  })

  it('credits the 3D model author as the CC BY licence requires', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: site.credit.author })).toHaveAttribute('href', site.credit.authorUrl)
    expect(screen.getByRole('link', { name: site.credit.license })).toBeInTheDocument()
  })

  it('uses the name as the page title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(site.name)
  })

  it('has an about section with the portrait and a call to action', () => {
    render(<App />)
    const about = document.getElementById('sobre')!
    expect(within(about).getByRole('img', { name: site.about.photo.alt })).toBeInTheDocument()
    expect(within(about).getAllByRole('listitem')).toHaveLength(site.about.points.length)
    expect(within(about).getByRole('link', { name: new RegExp(site.about.cta) })).toHaveAttribute('href', '#contato')
  })

  it('offers e-mail as a button without printing the address', () => {
    render(<App />)
    const contact = document.getElementById('contato')!
    expect(within(contact).getByRole('link', { name: new RegExp(site.contact.cta) })).toHaveAttribute('href', `mailto:${site.email}`)
    expect(contact.textContent).not.toContain(site.email)
  })

  it('keeps the rendered poster when WebGL is unavailable', async () => {
    const { container } = render(<App />)
    // jsdom has no WebGL: the stage falls back to the still image
    expect(await vi.waitFor(() => container.querySelector('.stage.gl-off'))).not.toBeNull()
  })

  it('hides optional contact links that are not filled in', () => {
    render(<App />)
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).toBeNull()
  })
})
