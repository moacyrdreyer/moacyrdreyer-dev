# moacyrdreyer.dev

Landing page pessoal de **Moacyr Dreyer**, desenvolvedor full stack.

O hero mostra um MacBook Pro fotorrealista renderizado no Blender: a rolagem controla a sequência de quadros (a tampa abre, o notebook gira e a câmera mergulha na tela), e a tela exibe HTML de verdade, colado em perspectiva a partir dos cantos exportados do render.

## Stack

- Vite + React + TypeScript, CSS puro (variáveis), fontes self-hosted (Geist, IBM Plex Mono)
- Vitest + Testing Library
- Blender 5.2 (Cycles) para a sequência do hero
- Deploy estático na Vercel

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # testes
npm run build    # build de produção em dist/
```

## Editando o conteúdo

Todo o texto, links e projetos ficam em [`src/data/site.ts`](src/data/site.ts). Campos vazios (`linkedin`, `whatsapp`) escondem o item.

## Deploy na Vercel (plano gratuito)

1. Em [vercel.com/new](https://vercel.com/new), importe o repositório `moacyrdreyer/moacyrdreyer-dev`.
2. A Vercel detecta Vite sozinha (build `npm run build`, saída `dist`). Clique em **Deploy**.
3. Cada `git push` na `main` publica uma nova versão.

`vercel.json` deixa os quadros (`/seq/*`) com cache imutável, então quem volta ao site não baixa as imagens de novo.

## Refazendo o render do MacBook

Os scripts ficam em `render/scripts`. O modelo e o HDRI não são versionados:

1. Baixe o modelo [macbook pro M3 16 inch 2024](https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4) em glTF e extraia em `render/model/`.
2. Baixe o HDRI [studio_small_09 (2K)](https://polyhaven.com/a/studio_small_09) em `render/hdri/`.
3. Renderize (≈35 min numa RTX 3050):

   ```bash
   blender -b --factory-startup --python render/scripts/render_seq.py -- \
     render/model/scene.gltf render/hdri/studio_small_09_2k.hdr render/out/desktop 90 1600 1000 48
   ```

4. Copie `render/out/desktop/*` para `public/seq/desktop/` e gere a versão de celular e a imagem de compartilhamento:

   ```bash
   npm run frames:mobile
   ```

Para testar luz e ângulo rápido, renderize só alguns quadros: acrescente `only=1,30,60,90` ao final do comando.

## Créditos

- Modelo 3D: “macbook pro M3 16 inch 2024” por [jackbaeten](https://sketchfab.com/jackbaeten), licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modificado: logo removido, materiais e iluminação.
- HDRI: [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0.
- Direção visual inspirada no estilo editorial do Sanity.io (via Refero), com paleta própria.
