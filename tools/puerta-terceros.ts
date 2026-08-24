#!/usr/bin/env node
/**
 * El humilde de la puerta de build de terceros (paso 7 de
 * `progress/plan_adaptacion_scss.md` §5, nivel B-2 de su §4.2): cablea
 * `node:fs` y `node:process` con `ejecutarPuertaDeTerceros`
 * (`src/lib/diseno/puertaTerceros.ts`, módulo puro, testeado y mordible por
 * StrykerJS). Aquí NO se decide nada: solo se lee `dist/` de verdad y se
 * traduce el informe en un código de salida.
 *
 * Enganchado SOLO a `pnpm run build` (`package.json`), NUNCA a `pnpm run
 * dev`: la puerta separa VER (desarrollo local, donde una petición a un
 * tercero puede ser temporalmente legítima mientras se porta el diseño) de
 * PUBLICAR (el artefacto de producción, donde no lo es nunca).
 *
 * Se ejecuta con el "type stripping" nativo de Node 22
 * (`--experimental-strip-types`, ver `package.json` → `scripts.build`), que
 * exige la extensión `.ts` explícita en el import relativo de abajo;
 * `tsconfig.app.json` ya trae `allowImportingTsExtensions`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import process from 'node:process'
import { DOMINIOS_DE_TERCEROS_PROHIBIDOS, ejecutarPuertaDeTerceros, type ArchivoDeSalida } from '../src/lib/diseno/puertaTerceros.ts'

const DIRECTORIO_DEL_ARTEFACTO = 'dist'

/** Solo CSS y HTML: son los dos tipos de fichero donde una URL de terceros puede vivir como texto. Los `.js` minificados pueden inlinear datos de negocio legítimos (teléfono, JSON-LD) que un grep ingenuo confundiría con un hallazgo. */
const ES_CSS_O_HTML = /\.(css|html)$/i

function leerArchivosDelArtefacto(): readonly ArchivoDeSalida[] {
  // LANZA si "dist/" no existe: es el contrato de `readdirSync`, y es correcto que la
  // puerta falle cerrada con ese error en vez de tragárselo y reportar "0 hallazgos".
  return readdirSync(DIRECTORIO_DEL_ARTEFACTO, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && ES_CSS_O_HTML.test(entrada.name))
    .map((entrada) => {
      const ruta = `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/')
      return { ruta, contenido: readFileSync(ruta, 'utf8') }
    })
}

const CODIGO_EXITO = 0
const CODIGO_FALLO = 1

const informe = ejecutarPuertaDeTerceros(leerArchivosDelArtefacto(), DOMINIOS_DE_TERCEROS_PROHIBIDOS)

if (informe.pasa) {
  console.log(
    `✓ Puerta de terceros: ${String(informe.archivosInspeccionados)} archivo(s) de "${DIRECTORIO_DEL_ARTEFACTO}/" inspeccionados, ninguna referencia a un dominio de terceros.`,
  )
  process.exit(CODIGO_EXITO)
}

console.error(`✗ Puerta de terceros: el build de producción NO puede publicarse.${informe.motivo === undefined ? '' : ` ${informe.motivo}.`}`)
for (const hallazgo of informe.hallazgos) {
  console.error(`  ✗ ${hallazgo.ruta} referencia "${hallazgo.dominio}"`)
}
process.exit(CODIGO_FALLO)
