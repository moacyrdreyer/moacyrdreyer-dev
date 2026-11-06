/**
 * Real-time MacBook (three.js). Loaded lazily by MacbookHero so the rest of the page
 * never waits for WebGL. Same camera story as the Blender render: closed laptop at an
 * angle -> lid opens -> turns to face you -> camera dives into the screen.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { codeTokens, site } from '../../data/site'

export interface SceneOptions {
  /** Scroll progress of the hero, 0..1 (already smoothed by the caller). */
  progress: () => number
  reduced: boolean
  onLoad: () => void
  onProgress: (pct: number) => void
  onError: () => void
}

export interface MacbookScene {
  dispose: () => void
}

/* Blender (Z-up) -> three (Y-up) */
const B = (x: number, y: number, z: number) => new THREE.Vector3(x, z, -y)
const sph = (t: number[], d: number, yawDeg: number, elDeg: number) => {
  const yaw = THREE.MathUtils.degToRad(yawDeg)
  const el = THREE.MathUtils.degToRad(elDeg)
  return B(t[0] + Math.sin(yaw) * Math.cos(el) * d, t[1] - Math.cos(yaw) * Math.cos(el) * d, t[2] + Math.sin(el) * d)
}

const MID = [0, 0.03, 0.07]
const FRONT = [0, 0.05, 0.09]
const SCREEN_C = [0, 0.1694, 0.1176]
const SCREEN_N = [0, -0.9398, 0.3416]
const SCREEN_W = 0.34385
/** Distance at which the screen fills a 50mm / 36mm-wide view. */
const FILL = (SCREEN_W / 2 / Math.tan(Math.atan(18 / 50))) * 0.985

interface Key { t: number; cam: THREE.Vector3; tgt: THREE.Vector3; yaw: number; lid: number; shift: number }
const KEYS: Key[] = [
  // the closed laptop starts smaller and further right, clear of the headline
  { t: 0.0, cam: sph(MID, 1.16, -8, 30), tgt: B(MID[0], MID[1], MID[2]), yaw: -32, lid: 1, shift: -0.21 },
  { t: 0.14, cam: sph(MID, 1.1, -6, 27), tgt: B(MID[0], MID[1], MID[2]), yaw: -30, lid: 1, shift: -0.2 },
  { t: 0.45, cam: sph(MID, 0.95, -2, 18), tgt: B(MID[0], MID[1], MID[2]), yaw: -16, lid: 0, shift: -0.1 },
  { t: 0.7, cam: sph(FRONT, 0.86, 0, 12), tgt: B(FRONT[0], FRONT[1], FRONT[2]), yaw: 0, lid: 0, shift: 0 },
  {
    t: 1.0,
    cam: B(SCREEN_C[0] + SCREEN_N[0] * FILL, SCREEN_C[1] + SCREEN_N[1] * FILL, SCREEN_C[2] + SCREEN_N[2] * FILL),
    tgt: B(SCREEN_C[0], SCREEN_C[1], SCREEN_C[2]),
    yaw: 0,
    lid: 0,
    shift: 0,
  },
]
const smoothstep = (t: number) => t * t * (3 - 2 * t)
function sample(p: number) {
  p = Math.min(1, Math.max(0, p))
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++
  const a = KEYS[i], b = KEYS[i + 1]
  const k = smoothstep((p - a.t) / (b.t - a.t))
  return {
    cam: a.cam.clone().lerp(b.cam, k),
    tgt: a.tgt.clone().lerp(b.tgt, k),
    yaw: a.yaw + (b.yaw - a.yaw) * k,
    lid: a.lid + (b.lid - a.lid) * k,
    shift: a.shift + (b.shift - a.shift) * k,
  }
}

/* token colours for the editor drawn on the screen */
const TOKEN_COLORS: Record<string, string> = { 't-c': '#5b6068', 't-k': '#8fa3bf', 't-s': '#b8e0c2', 't-f': '#ffffff', 't-p': '#8a8f97', '': '#c4c8ce' }
const TOTAL = codeTokens.reduce((n, [s]) => n + s.length, 0)
/** Past this progress the screen shows the editor instead of the boot splash. */
const IDE_FROM = 0.62

function makeScreen() {
  const sc = document.createElement('canvas')
  sc.width = 1440
  sc.height = 900
  const x2 = sc.getContext('2d')!
  const tex = new THREE.CanvasTexture(sc)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8

  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    x2.beginPath()
    x2.roundRect(x, y, w, h, r)
  }
  const draw = (phase: 'boot' | 'ide', typed: number, blink: boolean) => {
    const g = x2.createRadialGradient(1008, 0, 0, 1008, 0, 1500)
    g.addColorStop(0, '#23262c')
    g.addColorStop(0.7, '#0c0d0f')
    x2.fillStyle = g
    x2.fillRect(0, 0, 1440, 900)
    // menu bar
    x2.fillStyle = 'rgba(255,255,255,.04)'
    x2.fillRect(0, 0, 1440, 40)
    x2.fillStyle = 'rgba(255,255,255,.78)'
    x2.textBaseline = 'middle'
    x2.font = '600 19px "Geist Variable"'
    x2.fillText(site.name, 28, 21)
    x2.font = '400 19px "Geist Variable"'
    x2.fillText('Arquivo    Editar    Ver', 178, 21)
    x2.textAlign = 'right'
    x2.fillText(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 1412, 21)
    x2.textAlign = 'left'
    // notch
    x2.fillStyle = '#000'
    rr(1440 * 0.447, -16, 1440 * 0.106, 900 * 0.046 + 16, 16)
    x2.fill()

    if (phase === 'boot') {
      x2.fillStyle = '#e9ebee'
      x2.font = '500 120px "Geist Variable"'
      x2.textAlign = 'center'
      x2.fillText(site.name, 700, 450)
      const w = x2.measureText(site.name).width
      x2.textAlign = 'left'
      x2.fillStyle = '#c4c8ce'
      x2.beginPath()
      x2.arc(700 + w / 2 + 22, 480, 12, 0, Math.PI * 2)
      x2.fill()
      return
    }
    // editor window
    x2.fillStyle = 'rgba(23,25,28,.95)'
    rr(70, 70, 1300, 770, 18)
    x2.fill()
    x2.strokeStyle = '#2e3137'
    x2.lineWidth = 2
    x2.stroke()
    x2.beginPath()
    x2.moveTo(70, 134)
    x2.lineTo(1370, 134)
    x2.stroke()
    for (let k = 0; k < 3; k++) {
      x2.fillStyle = '#2e3137'
      x2.beginPath()
      x2.arc(106 + k * 30, 102, 8, 0, Math.PI * 2)
      x2.fill()
    }
    x2.fillStyle = '#212328'
    rr(210, 84, 250, 36, 6)
    x2.fill()
    x2.fillStyle = '#e3e5e8'
    x2.font = '500 22px "IBM Plex Mono"'
    x2.fillText('api/projects.ts', 228, 103)
    x2.font = '400 30px "IBM Plex Mono"'
    x2.textBaseline = 'alphabetic'
    let x = 118, y = 204, left = typed
    for (const [s, cls] of codeTokens) {
      if (left <= 0) break
      const part = s.slice(0, left)
      left -= part.length
      x2.fillStyle = TOKEN_COLORS[cls] ?? '#c4c8ce'
      part.split('\n').forEach((ln, li) => {
        if (li > 0) {
          x = 118
          y += 49.5
        }
        if (ln) {
          x2.fillText(ln, x, y)
          x += x2.measureText(ln).width
        }
      })
    }
    if (blink) {
      x2.fillStyle = '#e3e5e8'
      x2.fillRect(x + 2, y - 30, 16, 36)
    }
  }
  return { tex, draw }
}

export function createMacbookScene(canvas: HTMLCanvasElement, opts: SceneOptions): MacbookScene {
  const { reduced } = opts
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  const coarse = matchMedia('(pointer: coarse)').matches
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.AgXToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 20)
  camera.filmGauge = 36

  const pmrem = new THREE.PMREMGenerator(renderer)
  let envTex: THREE.Texture | null = null
  new HDRLoader().load('/3d/studio_1k.hdr', hdr => {
    envTex = pmrem.fromEquirectangular(hdr).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.55
    scene.environmentRotation = new THREE.Euler(0, THREE.MathUtils.degToRad(110), 0)
    hdr.dispose()
  })

  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.copy(B(-0.8, -0.55, 0.9))
  scene.add(key)
  // near-overhead light only for the soft contact shadow under the laptop
  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.35)
  shadowLight.position.copy(B(-0.15, -0.1, 1.4))
  shadowLight.castShadow = true
  shadowLight.shadow.mapSize.set(1024, 1024)
  const sc = shadowLight.shadow.camera
  sc.left = sc.bottom = -0.4
  sc.right = sc.top = 0.4
  sc.near = 0.5
  sc.far = 3
  shadowLight.shadow.radius = 18
  shadowLight.shadow.blurSamples = 24
  shadowLight.shadow.bias = -0.0005
  scene.add(shadowLight)
  const rim = new THREE.DirectionalLight(0xdfe6ff, 1.4)
  rim.position.copy(B(0.75, 0.6, 0.15))
  scene.add(rim)
  const rimL = new THREE.DirectionalLight(0xffffff, 0.8)
  rimL.position.copy(B(-0.75, 0.6, 0.12))
  scene.add(rimL)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.ShadowMaterial({ opacity: 0.5 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.01075
  ground.receiveShadow = true
  scene.add(ground)

  const screen = makeScreen()

  /* model */
  const draco = new DRACOLoader().setDecoderPath('/draco/')
  const loader = new GLTFLoader().setDRACOLoader(draco)
  const rig = new THREE.Group()
  scene.add(rig)
  let hinge: THREE.Object3D | null = null
  let screenMat: THREE.MeshStandardMaterial | null = null
  let laptop: THREE.Object3D | null = null
  let closedAngle = 1.933
  loader.load(
    '/3d/macbook.glb',
    gltf => {
      laptop = gltf.scene
      laptop.traverse(o => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) mesh.castShadow = true
        if (o.name === 'LidHinge') hinge = o
        if (o.name === 'Laptop' && typeof o.userData.closedAngle === 'number') closedAngle = o.userData.closedAngle
        if (mesh.isMesh && (o.name === 'Screen' || o.parent?.name === 'Screen')) {
          screenMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.12,
            metalness: 0,
            emissive: 0xffffff,
            emissiveMap: screen.tex,
            emissiveIntensity: 0,
          })
          mesh.material = screenMat
        }
      })
      rig.add(laptop)
      opts.onLoad()
    },
    e => e.total && opts.onProgress(Math.round((e.loaded / e.total) * 100)),
    () => opts.onError(),
  )

  /* interaction: follow the pointer, drag to spin (springs back) */
  let tx = 0, ty = 0, mx = 0, my = 0
  let dragging = false, lastX = 0, dragYaw = 0, dragVel = 0, hovering = false, p = 0
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const onWinMove = (e: PointerEvent) => {
    tx = e.clientX / innerWidth - 0.5
    ty = e.clientY / innerHeight - 0.5
    if (dragging) {
      const dx = e.clientX - lastX
      lastX = e.clientX
      dragYaw += dx * 0.008
      dragVel = dx * 0.008
    }
  }
  const onCanvasMove = (e: PointerEvent) => {
    if (!laptop || e.pointerType !== 'mouse') return
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    hovering = ray.intersectObject(laptop, true).length > 0
    if (!dragging) canvas.style.cursor = hovering && p < 0.6 ? 'grab' : ''
  }
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && hovering && p < 0.6) {
      dragging = true
      lastX = e.clientX
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = 'grabbing'
    }
  }
  const onUp = () => {
    dragging = false
    canvas.style.cursor = ''
  }
  if (!reduced) {
    addEventListener('pointermove', onWinMove, { passive: true })
    canvas.addEventListener('pointermove', onCanvasMove)
    canvas.addEventListener('pointerdown', onDown)
    addEventListener('pointerup', onUp)
  }

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.setFocalLength(w >= h ? 50 : 50 * (w / h) * 1.25)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  /* render only while the hero is on screen */
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(canvas)

  const timer = new THREE.Timer()
  let raf = 0, phase: 'boot' | 'ide' = 'boot', typingStart = 0, lastSig = ''
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    timer.update(now)
    if (!visible) return
    const t = timer.getElapsed()
    const dt = Math.min(timer.getDelta(), 0.05)
    p = opts.progress()
    const s = sample(p)
    const free = 1 - Math.min(1, p / 0.7)
    mx += (tx - mx) * 0.06
    my += (ty - my) * 0.06
    if (!dragging) {
      dragYaw *= Math.pow(0.02, dt)
      dragYaw += dragVel
      dragVel *= 0.9
    }

    camera.position.copy(s.cam)
    camera.lookAt(s.tgt)
    if (camera.aspect < 1) {
      // phones: no lateral shift; start with the laptop a bit lower, centre it as you scroll
      camera.filmOffset = 0
      const w = canvas.clientWidth, h = canvas.clientHeight
      camera.setViewOffset(w, h, 0, h * 0.2 * (1 - Math.min(1, p / 0.35)), w, h)
    } else {
      camera.clearViewOffset()
      camera.filmOffset = (s.shift * camera.getFilmWidth() * camera.getFilmWidth()) / camera.getFocalLength()
    }
    camera.updateProjectionMatrix()

    rig.rotation.set(-my * 0.18 * free, THREE.MathUtils.degToRad(s.yaw) + (mx * 0.55 + dragYaw) * free, 0)
    rig.position.y = reduced ? 0 : Math.sin(t * 1.2) * 0.004 * free
    if (hinge) hinge.rotation.x = closedAngle * s.lid

    const on = Math.min(1, Math.max(0, (1 - s.lid - 0.55) / 0.35))
    // diving into the screen: fade the lights' reflections off the glass
    const dive = THREE.MathUtils.smoothstep(p, 0.78, 0.97)
    key.intensity = 1.5 * (1 - dive)
    rim.intensity = 1.4 * (1 - dive)
    rimL.intensity = 0.8 * (1 - dive)
    shadowLight.intensity = 0.35 * (1 - dive)
    const sm = screenMat as THREE.MeshStandardMaterial | null
    if (sm) {
      sm.emissiveIntensity = on * 1.15
      sm.envMapIntensity = 1 - dive
      sm.roughness = 0.12 + 0.88 * dive
    }

    const next = p < IDE_FROM ? 'boot' : 'ide'
    if (next !== phase) {
      phase = next
      if (phase === 'ide' && !typingStart) typingStart = t
    }
    const typed = phase === 'ide' ? (reduced ? TOTAL : Math.min(TOTAL, Math.floor((t - typingStart) * 34))) : 0
    const blink = phase === 'ide' && Math.floor(t * 2) % 2 === 0
    const sig = `${phase}|${typed}|${blink}|${new Date().getMinutes()}`
    if (sig !== lastSig) {
      screen.draw(phase, typed, blink)
      screen.tex.needsUpdate = true
      lastSig = sig
    }

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  return {
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      removeEventListener('pointermove', onWinMove)
      removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointermove', onCanvasMove)
      canvas.removeEventListener('pointerdown', onDown)
      draco.dispose()
      screen.tex.dispose()
      envTex?.dispose()
      pmrem.dispose()
      scene.traverse(o => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry.dispose()
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach(m => m.dispose())
        }
      })
      renderer.dispose()
    },
  }
}

/** True when the browser can create a WebGL2 context. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}
