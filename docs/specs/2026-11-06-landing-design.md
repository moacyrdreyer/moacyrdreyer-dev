# Landing page pessoal — design aprovado

Data: 2026-11-06 · Autor: Moacyr Dreyer (com Claude)

## Objetivo

Landing page pessoal de desenvolvedor full stack, com dois públicos: clientes (freelance) e recrutadores. Sucesso = a pessoa entende em segundos o que eu faço, vê trabalho real e tem um caminho óbvio para falar comigo.

## Direção visual

- Base: estilo editorial do Sanity.io (Refero), com paleta própria **Silver & Graphite sobre Obsidian**.
- Cores: Obsidian `#101113`; grafites `#17191c` `#212328` `#2e3137`; Steel `#5b6068`; Mid `#8a8f97`; Silver `#c4c8ce` `#e3e5e8`; Mist `#f1f2f4` (seções claras); sinal verde `#3ddc84` só no status "disponível".
- Destaque = gradiente metálico prateado (botão principal e títulos), sem laranja.
- Tipografia: Geist (texto e títulos) e IBM Plex Mono (rótulos, números, código), self-hosted.
- Regras do estilo mantidas: seções numeradas, texto alinhado à esquerda, grid assimétrico 5/7, botões em pílula, sem sombras.

## Estrutura da página

1. **Hero** — MacBook Pro fotorrealista renderizado no Blender como sequência de quadros, controlada pela rolagem: começa fechado à direita do texto, a tampa abre, a tela liga, gira de frente e a câmera mergulha até a tela preencher a viewport. A tela mostra HTML real (boot "Moacyr Dreyer." → editor com código sendo digitado) colado em perspectiva com os cantos exportados do Blender (homografia → `matrix3d`, `mix-blend-mode: screen`). Mouse inclina levemente a cena. Fundo com linhas de estratos animadas.
2. **00 Vitrine** — "Do commit ao ar.": editor digitando + terminal com testes e deploy.
3. **01 Serviços** — Front-end; Back-end & APIs; Integrações & automação; Landing pages & produto.
4. **02 Projetos** — Limiar (soulimiar.com.br) e Limiar Finance (descrição genérica: painel financeiro com integrações de cobrança), mockups em CSS.
5. **03 Código aberto** — **um único card** com link para `github.com/moacyrdreyer?tab=repositories` (contagem de repositórios públicos buscada ao vivo, com fallback silencioso).
6. **04 Stack** — faixas de tecnologias em movimento + grupos.
7. **05 Processo** — 5 etapas com linha desenhada pela rolagem.
8. **06 Contato** — e-mail com copiar, GitHub, Instagram (LinkedIn/WhatsApp ocultos até preencher). Rodapé com crédito CC BY do modelo 3D.

## Motion

Revelação palavra a palavra no título; fade/subida escalonados; números com efeito "scramble"; botões magnéticos; reflexo nos cards; marquee; linha do processo. Tudo respeita `prefers-reduced-motion` (hero vira um quadro estático, sem rolagem longa).

## Técnica

- Vite + React + TypeScript, CSS puro com variáveis (sem framework de UI). Conteúdo em `src/data/site.ts`.
- Quadros em WebP: desktop 90 × 1600×1000; mobile 45 × 960×600 (gerados a partir do desktop). Carregamento progressivo a partir do quadro atual; cache imutável na Vercel.
- Lógica pura testada com Vitest: homografia, mapeamento rolagem→quadro, quadro carregado mais próximo, contagem do GitHub.
- Deploy: Vercel Hobby (site estático). Repositório público `moacyrdreyer/moacyrdreyer-dev`.

## Ativos e licenças

- Modelo: "macbook pro M3 16 inch 2024" por jackbaeten, CC BY 4.0 (crédito no rodapé). Modificado: logo da Apple removido, materiais de alumínio e iluminação próprios.
- HDRI: Poly Haven "studio_small_09", CC0.
- O modelo e o HDRI não são versionados (estão no `.gitignore`); os scripts de render ficam em `render/scripts`.

## Fora do escopo (v1)

Blog, CMS, formulário com backend, analytics, internacionalização, modelo 3D interativo em WebGL (plano B caso a sequência não agrade).
