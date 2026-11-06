# Plano de implementação — landing page

Spec: `docs/specs/2026-11-06-landing-design.md`

1. **Base do projeto** — Vite + React + TS manual, fontes self-hosted, Vitest + jsdom, `.gitignore` (node_modules, dist, render/model, render/hdri, render/out).
2. **Lógica pura com testes (TDD)** — `lib/homography.ts`, `lib/sequence.ts` (progresso→quadro, quadro mais próximo, cover/contain fit), `lib/github.ts` (contagem de repos com cache e fallback).
3. **Tokens e estilos globais** — `styles/global.css` com paleta, tipografia, botões, utilitários de reveal.
4. **Componentes de UI** — `Reveal`, `Scramble`, `Magnetic`, `TypedCode`.
5. **Hero** — `MacbookHero` (canvas da sequência, tela HTML com homografia, inclinação, estratos, fade do texto, reduced motion, layout mobile).
6. **Seções** — Nav, Vitrine, Serviços, Projetos, Código aberto (card único), Stack, Processo, Contato + rodapé.
7. **Quadros** — copiar render final para `public/seq/desktop`, gerar `public/seq/mobile` (script `scripts/make-mobile.mjs` com sharp).
8. **SEO e deploy** — meta tags, OG image (quadro do render), favicon, `vercel.json` com cache imutável em `/seq/*`.
9. **Verificação** — `npm test`, `npm run build`, preview local + prints headless (desktop e mobile).
10. **GitHub** — `git init`, commits, `gh repo create moacyrdreyer-dev --public --push`.
