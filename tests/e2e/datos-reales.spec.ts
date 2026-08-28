// Bloque G de `features/rediseno_visual.feature` (@s49, @s50, @s52): "los datos
// siguen siendo los reales", medido sobre el ARTEFACTO DE PRODUCCIÓN y sobre el
// texto visible de las seis rutas del sitio construido y servido — no sobre un
// componente aislado en jsdom.
//
// La lógica de cada puerta es pura y vive en `src/lib/diseno/datosDelSitio.ts`
// (mutada por StrykerJS y mordida por `datosDelSitio.test.ts`); aquí solo se
// MIDE el sitio real y se le pasa a esa lógica, igual que
// `despliegue-subpath.spec.ts:139` hace con `ejecutarPuertaDeTerceros`.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from 'playwright/test'
import { EQUIPO } from '../../src/data/equipo'
import { GALERIA } from '../../src/data/galeria'
import { SERVICIOS } from '../../src/data/servicios'
import {
  contarEntradasDelCatalogoDelPrototipo,
  cualificadorDeclaradoDe,
  ejecutarPuertaDeAfirmacionesProhibidas,
  ejecutarPuertaDeCompromisoDeUrgencias,
  ejecutarPuertaDeLiteralesFicticios,
  ejecutarPuertaDeRecuentosReales,
  leerPistaDeVistaPrevia,
  type AfirmacionProhibida,
  type FicheroDeTexto,
  type LiteralFicticio,
  type TextoDeRuta,
} from '../../src/lib/diseno/datosDelSitio'
import { datosNegocio } from '../../src/lib/site'
import { RECUENTO_DE_RUTAS, RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

const RAIZ_DEL_REPO = fileURLToPath(new URL('../..', import.meta.url))
const ES_TEXTO_SERVIDO = /\.(?:html|css|js)$/

/** El prototipo versionado del que salen todos los datos y recuentos ficticios. */
const TEXTO_DEL_PROTOTIPO = readFileSync(
  `${RAIZ_DEL_REPO}/docs/diseno-claude-design/Veterinaria La Sierra.dc.html`,
  'utf8',
)

/**
 * Los datos de la clínica ficticia, ESCRITOS A MANO (Given de @s49), leídos del
 * prototipo y declarados FALSOS para Galapavet en `docs/datos-galapavet.md` §7.
 * Se retipean aquí a propósito, y no se importan de `datosDelSitio.test.ts`:
 * mismo criterio de "literal escrito a mano" que `tests/e2e/rutas.ts`.
 */
const LITERALES_DE_LA_CLINICA_FICTICIA: readonly LiteralFicticio[] = [
  { categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' },
  { categoria: 'localidad', literal: 'Miraflores de la Sierra' },
  { categoria: 'teléfono', literal: '918 44 21 60' },
  { categoria: 'teléfono', literal: '640 22 11 90' },
  { categoria: 'correo electrónico', literal: 'hola@veterinarialasierra.es' },
]

/**
 * El artefacto de producción no puede citar ni siquiera la RUTA del prototipo:
 * los comentarios se quedan en el código fuente, nunca llegan a `dist/`.
 */
const SIN_CITAS_PERMITIDAS: readonly string[] = []

/**
 * Las afirmaciones de disponibilidad que Galapavet NO puede hacer, una por cada
 * una de las dos primeras cláusulas de @s52. Todas salen del reclamo del
 * prototipo «Urgencias 24 h · todos los días del año», declarado FALSO en
 * `docs/datos-galapavet.md` §7 («domingos cerrado; solo urgencias fuera de
 * horario»). Escritas a mano.
 */
const AFIRMACIONES_PROHIBIDAS: readonly AfirmacionProhibida[] = [
  { categoria: 'atención continuada las veinticuatro horas', frase: '24 h' },
  { categoria: 'atención continuada las veinticuatro horas', frase: '24h' },
  { categoria: 'atención continuada las veinticuatro horas', frase: '24 horas' },
  { categoria: 'atención continuada las veinticuatro horas', frase: 'veinticuatro horas' },
  { categoria: 'atención todos los días del año', frase: 'todos los días del año' },
  { categoria: 'atención todos los días del año', frase: 'los 365 días' },
  { categoria: 'atención todos los días del año', frase: '365 días al año' },
]

/**
 * Los cualificadores que pueden seguir a la palabra "urgencias". El primero es
 * el ÚNICO compromiso que Galapavet declara (`src/lib/site.ts` →
 * `ROTULO_URGENCIAS`); los demás son los del prototipo. Escritos a mano.
 */
const CUALIFICADORES_DE_URGENCIAS: readonly string[] = [
  'fuera de horario',
  '24 h',
  '24h',
  '24 horas',
  'veinticuatro horas',
  'todos los días del año',
  'todos los días',
  'los 365 días',
  'permanentes',
]

/** Todo lo que `vite build` deja servido y es texto: HTML, CSS y JS. */
function leerArtefactoDeProduccion(): readonly FicheroDeTexto[] {
  return readdirSync(`${RAIZ_DEL_REPO}/dist`, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && ES_TEXTO_SERVIDO.test(entrada.name))
    .map((entrada) => {
      const ruta = `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/')
      return { ruta, contenido: readFileSync(ruta, 'utf8') }
    })
}

/** El texto VISIBLE de las seis rutas del inventario, medido en el navegador real. */
async function leerTextoVisibleDeLasSeisRutas(page: Page): Promise<readonly TextoDeRuta[]> {
  const textos: TextoDeRuta[] = []
  for (const { ruta } of RUTAS_DEL_INVENTARIO) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    textos.push({ ruta, textoVisible: await page.evaluate(() => document.body.innerText) })
  }
  return textos
}

test.describe('@s49 ni un solo literal de la clínica ficticia del prototipo sobrevive en el sitio', () => {
  test('el artefacto de producción servido no conserva ningún dato de la clínica ficticia', () => {
    const ficheros = leerArtefactoDeProduccion()

    const informe = ejecutarPuertaDeLiteralesFicticios(
      LITERALES_DE_LA_CLINICA_FICTICIA,
      ficheros,
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.hallazgos).toEqual([])
    expect(informe.pasa).toBe(true)
    // Cláusula literal del escenario: el recuento de ficheros efectivamente
    // inspeccionados es mayor que 0.
    expect(informe.ficherosInspeccionados).toBeGreaterThan(0)
    expect(informe.literalesBuscados).toBe(5)
    // 4 literales con espacios aportan 2 formas cada uno y el correo aporta 1.
    expect(informe.formasBuscadas).toBe(9)
  })

  test('los cinco literales existen de verdad en el prototipo: el catálogo no es un espantapájaros', () => {
    const encontrados = LITERALES_DE_LA_CLINICA_FICTICIA.filter((ficticio) =>
      TEXTO_DEL_PROTOTIPO.includes(ficticio.literal),
    )

    expect(encontrados).toEqual(LITERALES_DE_LA_CLINICA_FICTICIA)
    expect(encontrados).toHaveLength(5)
  })

  test('el HTML servido de las seis rutas tampoco los conserva', async ({ page }) => {
    const documentos: FicheroDeTexto[] = []
    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
      documentos.push({ ruta, contenido: await page.content() })
    }

    const informe = ejecutarPuertaDeLiteralesFicticios(
      LITERALES_DE_LA_CLINICA_FICTICIA,
      documentos,
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.hallazgos).toEqual([])
    expect(informe.pasa).toBe(true)
    expect(informe.ficherosInspeccionados).toBe(RECUENTO_DE_RUTAS)
  })
})

test.describe('@s50 los recuentos que el sitio muestra son los reales, no los del prototipo', () => {
  test('los tres listados de la portada muestran el recuento del catálogo real', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.waitForLoadState('networkidle')

    const bloquesDeServicio = await page.locator('#servicios article').count()
    const profesionales = await page.locator('#equipo article').count()
    const fotografias = await page.locator('#galeria figure').count()

    // Cada recuento es el del catálogo real...
    expect(bloquesDeServicio).toBe(SERVICIOS.length)
    expect(profesionales).toBe(EQUIPO.length)
    expect(fotografias).toBe(GALERIA.length)

    // ...y no el del prototipo: 12 servicios, 6 profesionales y 9 fotografías,
    // escritos a mano y confirmados midiendo el texto real del prototipo en
    // `src/lib/diseno/datosDelSitio.test.ts`.
    expect(bloquesDeServicio).not.toBe(12)
    expect(profesionales).not.toBe(6)
    expect(fotografias).not.toBe(9)

    // Anti-vacuidad: los tres listados existen y tienen contenido.
    expect(bloquesDeServicio).toBeGreaterThan(0)
    expect(profesionales).toBeGreaterThan(0)
    expect(fotografias).toBeGreaterThan(0)
  })

  test('ningún recuento coincide con el del prototipo ni con su pista de vista previa', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.waitForLoadState('networkidle')

    const publicados = {
      servicios: await page.locator('#servicios article').count(),
      equipo: await page.locator('#equipo article').count(),
      galeria: await page.locator('#galeria figure').count(),
    }

    const informe = ejecutarPuertaDeRecuentosReales([
      {
        listado: 'servicios',
        publicado: publicados.servicios,
        delPrototipo: contarEntradasDelCatalogoDelPrototipo(TEXTO_DEL_PROTOTIPO, 'SERVICIOS') as number,
        deLaPistaDeVistaPrevia: leerPistaDeVistaPrevia(TEXTO_DEL_PROTOTIPO, 'servicios') as number,
      },
      {
        listado: 'equipo',
        publicado: publicados.equipo,
        delPrototipo: contarEntradasDelCatalogoDelPrototipo(TEXTO_DEL_PROTOTIPO, 'EQUIPO') as number,
        deLaPistaDeVistaPrevia: leerPistaDeVistaPrevia(TEXTO_DEL_PROTOTIPO, 'equipo') as number,
      },
      {
        listado: 'galería',
        publicado: publicados.galeria,
        delPrototipo: contarEntradasDelCatalogoDelPrototipo(TEXTO_DEL_PROTOTIPO, 'GALERIA') as number,
        deLaPistaDeVistaPrevia: leerPistaDeVistaPrevia(TEXTO_DEL_PROTOTIPO, 'galeria') as number,
      },
    ])

    expect(informe.discrepancias).toEqual([])
    expect(informe.pasa).toBe(true)
    expect(informe.listadosInspeccionados).toBe(3)
  })
})

test.describe('@s52 el sitio no afirma en ningún sitio que preste un servicio que no presta', () => {
  test('ninguna de las seis rutas afirma atención las veinticuatro horas ni todos los días del año', async ({
    page,
  }) => {
    const textos = await leerTextoVisibleDeLasSeisRutas(page)

    const informe = ejecutarPuertaDeAfirmacionesProhibidas(AFIRMACIONES_PROHIBIDAS, textos)

    expect(informe.hallazgos).toEqual([])
    expect(informe.pasa).toBe(true)
    expect(informe.rutasInspeccionadas).toBe(RECUENTO_DE_RUTAS)
    expect(informe.afirmacionesBuscadas).toBe(AFIRMACIONES_PROHIBIDAS.length)
    // Anti-vacuidad: las seis rutas tienen texto visible que recorrer.
    for (const { textoVisible } of textos) {
      expect(textoVisible.length).toBeGreaterThan(0)
    }
  })

  test('el único compromiso de urgencias que aparece es el que declara la fuente única', async ({ page }) => {
    const rotuloDeclarado = datosNegocio.telefonoUrgencias.rotulo
    expect(rotuloDeclarado).toBeDefined()
    const cualificadorDeclarado = cualificadorDeclaradoDe(rotuloDeclarado as string)
    expect(cualificadorDeclarado).toBe('fuera de horario')

    const textos = await leerTextoVisibleDeLasSeisRutas(page)

    const informe = ejecutarPuertaDeCompromisoDeUrgencias(
      CUALIFICADORES_DE_URGENCIAS,
      cualificadorDeclarado as string,
      textos,
    )

    expect(informe.compromisosEncontrados).toEqual([cualificadorDeclarado])
    expect(informe.pasa).toBe(true)
    expect(informe.rutasInspeccionadas).toBe(RECUENTO_DE_RUTAS)
    expect(informe.cualificadoresBuscados).toBe(CUALIFICADORES_DE_URGENCIAS.length)
  })
})
