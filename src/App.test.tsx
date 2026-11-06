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

  it('hides optional contact links that are not filled in', () => {
    render(<App />)
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).toBeNull()
  })
})
