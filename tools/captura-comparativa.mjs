// Captura la portada construida (dist/) a página completa y la monta al lado
// del prototipo de Claude Design, para MIRAR el resultado tras cada tramo.
//
//   node tools/captura-comparativa.mjs [etiqueta] [--sin-build]
//
// Salida en progress/rediseno/capturas/:
//   <etiqueta>_1440.png          portada completa a 1440 px
//   <etiqueta>_390.png           portada completa a 390 px (móvil)
//   <etiqueta>_comparativa.png   prototipo (izq.) | web (dcha.) a 1440 px
//
// Requisitos: `playwright` (ya es devDependency) y el prototipo renderizado en
// progress/rediseno/prototipo_1440.png (adjunto en el handoff del 03/09/2026;
// si falta, se omite la comparativa y se avisa).

import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const SUBPATH = '/GalapavetClinicaVeterinaria'
const PUERTO = 4179
const RAIZ = resolve(process.cwd())
const DIST = join(RAIZ, 'dist')
const SALIDA = join(RAIZ, 'progress', 'rediseno', 'capturas')
const PROTOTIPO = join(RAIZ, 'progress', 'rediseno', 'prototipo_1440.png')

const args = process.argv.slice(2)
const etiqueta = args.find((a) => !a.startsWith('--')) ?? 'actual'
const sinBuild = args.includes('--sin-build')

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml',
}

async function aDataUri(fichero) {
  return `data:image/png;base64,${(await readFile(fichero)).toString('base64')}`
}

if (!sinBuild) {
  console.log('▶ pnpm run build')
  execSync('pnpm run build', { stdio: 'inherit' })
}
if (!existsSync(DIST)) throw new Error('No existe dist/. Ejecuta pnpm run build.')
await mkdir(SALIDA, { recursive: true })

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  let ruta = url.pathname
  if (!ruta.startsWith(SUBPATH + '/') && ruta !== SUBPATH) { res.writeHead(404); res.end(); return }
  if (ruta === SUBPATH) { res.writeHead(302, { location: SUBPATH + '/' }); res.end(); return }
  ruta = ruta.slice(SUBPATH.length) || '/'
  let fichero = join(DIST, ruta)
  try {
    const s = await stat(fichero)
    if (s.isDirectory()) fichero = join(fichero, 'index.html')
  } catch {
    fichero = join(DIST, 'index.html') // SPA: cualquier ruta cae en index.html
  }
  try {
    const cuerpo = await readFile(fichero)
    res.writeHead(200, { 'content-type': MIME[extname(fichero)] ?? 'application/octet-stream' })
    res.end(cuerpo)
  } catch {
    res.writeHead(404); res.end()
  }
})
await new Promise((r) => servidor.listen(PUERTO, r))
console.log('▶ servidor en', PUERTO)
const BASE = `http://localhost:${PUERTO}${SUBPATH}/`

console.log('▶ lanzando chromium')
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})

async function capturar(ancho, destino) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 900 } })
  const errores = []
  pagina.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.text()) })
  pagina.on('response', (r) => { if (r.status() >= 400) errores.push(`HTTP ${r.status()} ${r.url()}`) })
  console.log('  → cargando', BASE)
  await pagina.goto(BASE, { waitUntil: 'load', timeout: 60000 })
  await pagina.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  // Forzar las imágenes lazy: recorrer toda la página y volver arriba.
  const altoTotal = await pagina.evaluate(() => document.documentElement.scrollHeight)
  const posicionesDeScroll = Array.from({ length: Math.ceil(altoTotal / 500) }, (_, indice) => indice * 500)
  await posicionesDeScroll.reduce(
    async (anterior, posicion) => {
      await anterior
      await pagina.evaluate((py) => window.scrollTo(0, py), posicion)
      await pagina.waitForTimeout(50)
    },
    Promise.resolve(),
  )
  await pagina.evaluate(() => window.scrollTo(0, 0))
  await pagina.waitForTimeout(800)
  const alto = await pagina.evaluate(() => document.documentElement.scrollHeight)
  console.log('  → capturando', alto, 'px')
  await pagina.screenshot({ path: destino, fullPage: true, timeout: 60000 })
  await pagina.close()
  return { alto, errores }
}

const capturas = await Promise.all([1440, 390].map(async (ancho) => {
  const destino = join(SALIDA, `${etiqueta}_${ancho}.png`)
  const { alto, errores } = await capturar(ancho, destino)
  console.log(`✓ ${destino}  (alto ${alto}px)`)
  for (const e of errores) console.log('  ⚠', e.slice(0, 160))
  return [ancho, destino]
}))
const ficheros = Object.fromEntries(capturas)

if (existsSync(PROTOTIPO)) {
  const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff">
    <div style="display:flex;gap:40px;align-items:flex-start;padding:20px">
      <figure style="margin:0"><figcaption style="font:600 28px system-ui;padding:0 0 12px">Prototipo Claude Design</figcaption><img src="${await aDataUri(PROTOTIPO)}" width="1440"></figure>
      <figure style="margin:0"><figcaption style="font:600 28px system-ui;padding:0 0 12px">Web — ${etiqueta}</figcaption><img src="${await aDataUri(ficheros[1440])}" width="1440"></figure>
    </div></body>`
  const pagina = await navegador.newPage({ viewport: { width: 2960, height: 1200 }, deviceScaleFactor: 0.5 })
  await pagina.setContent(html)
  const destino = join(SALIDA, `${etiqueta}_comparativa.png`)
  await pagina.screenshot({ path: destino, fullPage: true })
  console.log(`✓ ${destino}`)
  await pagina.close()
} else {
  console.log(`(sin comparativa: falta ${PROTOTIPO})`)
}

await navegador.close()
servidor.close()
console.log('\nAhora MIRA las capturas. Si no se parecen al prototipo, el tramo no está hecho.')
