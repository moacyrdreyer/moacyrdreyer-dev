// Builds the phone frame set from the desktop render:
// every 2nd frame, resized to 960x600, plus a matching screen.json.
// Also writes public/og.png (social preview) from a front-facing frame.
//   node scripts/make-mobile.mjs
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const SRC = 'public/seq/desktop'
const DST = 'public/seq/mobile'
const STEP = 2
const W = 960
const H = 600

const meta = JSON.parse(await readFile(join(SRC, 'screen.json'), 'utf8'))
await rm(DST, { recursive: true, force: true })
await mkdir(DST, { recursive: true })

const picks = []
for (let i = 0; i < meta.frames; i += STEP) picks.push(i)
if (picks.at(-1) !== meta.frames - 1) picks.push(meta.frames - 1) // keep the final "screen fills the view" frame

await Promise.all(
  picks.map((src, k) =>
    sharp(join(SRC, `f_${String(src + 1).padStart(4, '0')}.webp`))
      .resize(W, H)
      .webp({ quality: 78, alphaQuality: 90, effort: 5 })
      .toFile(join(DST, `f_${String(k + 1).padStart(4, '0')}.webp`)),
  ),
)

await writeFile(
  join(DST, 'screen.json'),
  JSON.stringify({ frames: picks.length, width: W, height: H, corners: picks.map(i => meta.corners[i]) }),
)

// social preview: front-facing open laptop with the name on its screen
const ogFrame = Math.round((meta.frames - 1) * 0.62)
const [tl, tr, br, bl] = meta.corners[ogFrame].c.map(([x, y]) => [x * 1200, y * 750])
const cx = (tl[0] + tr[0] + br[0] + bl[0]) / 4
const cy = (tl[1] + tr[1] + br[1] + bl[1]) / 4
const sw = tr[0] - tl[0]
const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750">
  <defs><radialGradient id="g" cx="70%" cy="0%" r="110%"><stop offset="0" stop-color="#23262c"/><stop offset=".7" stop-color="#0c0d0f"/></radialGradient></defs>
  <polygon points="${[tl, tr, br, bl].map(p => p.join(',')).join(' ')}" fill="url(#g)"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="${sw * 0.1}" letter-spacing="-2" fill="#e3e5e8">Moacyr Dreyer.</text>
  <text x="${cx}" y="${cy + sw * 0.07}" text-anchor="middle" font-family="Consolas, monospace" font-size="${sw * 0.03}" letter-spacing="2" fill="#8a8f97">DESENVOLVEDOR FULL STACK</text>
</svg>`)
await sharp(join(SRC, `f_${String(ogFrame + 1).padStart(4, '0')}.webp`))
  .resize(1200, 750)
  .flatten({ background: '#101113' })
  .composite([{ input: label }])
  .toBuffer()
  .then(buf => sharp(buf).resize(1200, 630, { fit: 'cover', position: 'top' }).png().toFile('public/og.png'))

for (const d of [SRC, DST]) {
  const files = (await readdir(d)).filter(f => f.endsWith('.webp'))
  const bytes = (await Promise.all(files.map(f => stat(join(d, f))))).reduce((a, s) => a + s.size, 0)
  console.log(`${d}: ${files.length} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB`)
}
