import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DOCUMENTO_DE_PROCEDENCIA_DEL_BUNDLE,
  FICHEROS_OBLIGATORIOS_DEL_BUNDLE,
  MOTOR_DE_RENDERIZADO_DEL_BUNDLE,
  PANTALLAS_DEL_BUNDLE,
  RECUENTO_ESPERADO_DE_PANTALLAS,
  SUFIJO_DE_FICHERO_DE_PANTALLA,
  ejecutarPuertaDelBundleDeDiseno,
  ficherosDePantalla,
} from './bundleDeDiseno'

// Literales ESCRITOS A MANO — leídos del árbol real de "docs/diseno-claude-design"
// el 26/08/2026 y retecleados aquí, no importados de lo que se comprueba
// (patrón doble-de-test-anclado-al-literal, @s41 de
// `features/rediseno_visual.feature:526`). Si el módulo cambiara su inventario
// en silencio, estas cuatro líneas lo delatan.
const PANTALLAS_A_MANO = ['Blog.dc.html', 'Campanas.dc.html', 'Tienda.dc.html', 'Veterinaria La Sierra.dc.html']
const MOTOR_A_MANO = 'support.js'
const PROCEDENCIA_A_MANO = 'README_BUNDLE.md'
const OBLIGATORIOS_A_MANO = [...PANTALLAS_A_MANO, MOTOR_A_MANO, PROCEDENCIA_A_MANO]

describe('rediseno_visual @s41 el inventario declarado del bundle de diseño', () => {
  it('declara exactamente los cuatro ficheros de pantalla del bundle', () => {
    expect(PANTALLAS_DEL_BUNDLE).toEqual(PANTALLAS_A_MANO)
  })

  it('el recuento de ficheros de pantalla exigido es exactamente 4', () => {
    expect(PANTALLAS_DEL_BUNDLE).toHaveLength(4)
    expect(RECUENTO_ESPERADO_DE_PANTALLAS).toBe(4)
  })

  it('declara el motor de renderizado y el documento de procedencia por su nombre real', () => {
    expect(MOTOR_DE_RENDERIZADO_DEL_BUNDLE).toBe(MOTOR_A_MANO)
    expect(DOCUMENTO_DE_PROCEDENCIA_DEL_BUNDLE).toBe(PROCEDENCIA_A_MANO)
  })

  it('los ficheros obligatorios son las cuatro pantallas más el motor más el documento de procedencia', () => {
    expect(FICHEROS_OBLIGATORIOS_DEL_BUNDLE).toEqual(OBLIGATORIOS_A_MANO)
    expect(FICHEROS_OBLIGATORIOS_DEL_BUNDLE).toHaveLength(6)
  })

  it('el sufijo que distingue un fichero de pantalla es el del exportador de diseño', () => {
    expect(SUFIJO_DE_FICHERO_DE_PANTALLA).toBe('.dc.html')
  })
})

describe('ficherosDePantalla', () => {
  it('se queda solo con los nombres que acaban en el sufijo de pantalla', () => {
    expect(ficherosDePantalla(['Blog.dc.html', 'support.js', 'README_BUNDLE.md'])).toEqual(['Blog.dc.html'])
  })

  it('devuelve los nombres ordenados, no en el orden en que el directorio los entrega', () => {
    expect(ficherosDePantalla(['Tienda.dc.html', 'Blog.dc.html'])).toEqual(['Blog.dc.html', 'Tienda.dc.html'])
  })

  it('no confunde un nombre que solo EMPIEZA por el sufijo con uno que acaba en él', () => {
    expect(ficherosDePantalla(['.dc.html.bak'])).toEqual([])
  })

  it('con una lista vacía no encuentra ninguna pantalla', () => {
    expect(ficherosDePantalla([])).toEqual([])
  })
})

describe('ejecutarPuertaDelBundleDeDiseno', () => {
  it('pasa cuando están los seis ficheros obligatorios y las pantallas son las esperadas', () => {
    const informe = ejecutarPuertaDelBundleDeDiseno(OBLIGATORIOS_A_MANO, OBLIGATORIOS_A_MANO, 4)

    expect(informe.pasa).toBe(true)
    expect(informe.faltantes).toEqual([])
    expect(informe.pantallas).toEqual(PANTALLAS_A_MANO)
    expect(informe.ficherosInspeccionados).toBe(6)
    expect(informe.motivo).toBeUndefined()
  })

  it('falla cerrada y lo motiva cuando el directorio del bundle está vacío', () => {
    const informe = ejecutarPuertaDelBundleDeDiseno([], OBLIGATORIOS_A_MANO, 4)

    expect(informe.pasa).toBe(false)
    expect(informe.ficherosInspeccionados).toBe(0)
    expect(informe.pantallas).toEqual([])
    expect(informe.faltantes).toEqual([])
    expect(informe.motivo).toBe('no se inspeccionó ningún fichero: el directorio del bundle de diseño está vacío')
  })

  it('falla cerrada y lo motiva cuando no se le exige ningún fichero obligatorio', () => {
    const informe = ejecutarPuertaDelBundleDeDiseno(OBLIGATORIOS_A_MANO, [], 4)

    expect(informe.pasa).toBe(false)
    expect(informe.pantallas).toEqual([])
    expect(informe.faltantes).toEqual([])
    expect(informe.motivo).toBe('no se comprobó ningún fichero obligatorio: la lista de ficheros exigidos está vacía')
  })

  it('falla cerrada y lo motiva cuando no se le exige ninguna pantalla', () => {
    const soloDocumentos = [MOTOR_A_MANO, PROCEDENCIA_A_MANO]

    const informe = ejecutarPuertaDelBundleDeDiseno(soloDocumentos, soloDocumentos, 0)

    expect(informe.pasa).toBe(false)
    expect(informe.pantallas).toEqual([])
    expect(informe.faltantes).toEqual([])
    expect(informe.motivo).toBe('no se exigió ninguna pantalla: el recuento esperado de pantallas no es mayor que 0')
  })

  it('detecta y nombra el motor de renderizado ausente, aunque el recuento de pantallas cuadre', () => {
    const sinMotor = OBLIGATORIOS_A_MANO.filter((nombre) => nombre !== MOTOR_A_MANO)

    const informe = ejecutarPuertaDelBundleDeDiseno(sinMotor, OBLIGATORIOS_A_MANO, 4)

    expect(informe.pasa).toBe(false)
    expect(informe.faltantes).toEqual([MOTOR_A_MANO])
    expect(informe.pantallas).toHaveLength(4)
  })

  it('detecta y nombra el documento de procedencia ausente', () => {
    const sinProcedencia = OBLIGATORIOS_A_MANO.filter((nombre) => nombre !== PROCEDENCIA_A_MANO)

    const informe = ejecutarPuertaDelBundleDeDiseno(sinProcedencia, OBLIGATORIOS_A_MANO, 4)

    expect(informe.pasa).toBe(false)
    expect(informe.faltantes).toEqual([PROCEDENCIA_A_MANO])
  })

  it('suspende cuando sobra una pantalla, aunque no falte ninguno de los obligatorios', () => {
    const conPantallaDeMas = [...OBLIGATORIOS_A_MANO, 'Extra.dc.html']

    const informe = ejecutarPuertaDelBundleDeDiseno(conPantallaDeMas, OBLIGATORIOS_A_MANO, 4)

    expect(informe.pasa).toBe(false)
    expect(informe.faltantes).toEqual([])
    expect(informe.pantallas).toHaveLength(5)
  })
})

// ----------------------------------------------------------------------------
// @s41 sobre el árbol REAL del repositorio (no un doble): el bundle versionado
// en "docs/diseno-claude-design" es el prototipo del que sale el rediseño.
// ----------------------------------------------------------------------------

const DIRECTORIO_DEL_BUNDLE = join(process.cwd(), 'docs', 'diseno-claude-design')

const nombresRealesDelBundle = (): readonly string[] => readdirSync(DIRECTORIO_DEL_BUNDLE)

describe('rediseno_visual @s41 el bundle versionado en "docs/diseno-claude-design"', () => {
  it('el recuento de ficheros efectivamente inspeccionados es mayor que 0', () => {
    expect(nombresRealesDelBundle().length).toBeGreaterThan(0)
  })

  it('existen los cuatro ficheros de pantalla, el motor de renderizado y el documento de procedencia', () => {
    const informe = ejecutarPuertaDelBundleDeDiseno(
      nombresRealesDelBundle(),
      FICHEROS_OBLIGATORIOS_DEL_BUNDLE,
      RECUENTO_ESPERADO_DE_PANTALLAS,
    )

    expect(informe.faltantes).toEqual([])
    expect(informe.pasa).toBe(true)
    expect(informe.ficherosInspeccionados).toBeGreaterThan(0)
  })

  it('el recuento de ficheros de pantalla del directorio real es exactamente 4', () => {
    expect(ficherosDePantalla(nombresRealesDelBundle())).toEqual(PANTALLAS_A_MANO)
    expect(ficherosDePantalla(nombresRealesDelBundle())).toHaveLength(4)
  })

  it('el documento de procedencia explica de dónde viene el bundle', () => {
    const texto = readFileSync(join(DIRECTORIO_DEL_BUNDLE, PROCEDENCIA_A_MANO), 'utf8')

    expect(texto).toContain('handoff bundle')
    expect(texto).toContain('Claude Design')
    expect(texto).toContain('claude.ai/design')
  })
})
