// @s14 de `features/rediseno_visual.feature`: "El único rótulo de urgencias
// del sitio es el real, con el teléfono real".
//
// Puerta de NAVEGADOR REAL sobre el artefacto construido y servido (`vite
// preview` sobre `dist/`, `playwright.config.ts` → `webServer`), recorriendo
// las SEIS rutas del inventario. En jsdom esto no se puede demostrar: allí
// solo se renderiza un componente aislado, y el escenario habla del sitio
// entero.
//
// POR QUÉ ESTE SPEC SÍ IMPORTA DE `src/`, al contrario que el resto de specs
// de esta carpeta: las tres cláusulas Then de @s14 no dicen "el rótulo es
// 'Urgencias fuera de horario'", dicen "el rótulo es EL QUE DECLARA LA FUENTE
// ÚNICA DE DATOS DE NEGOCIO" y "el enlace se deriva de ESE MISMO número, SIN
// RETIPEARLO". Un literal escrito a mano aquí probaría lo contrario de lo que
// el contrato pide: dejaría pasar un componente que retipea el teléfono, que
// es exactamente el defecto que `progress/rediseno/matriz_trazabilidad.md`
// (@s14) documenta en `tests/e2e/rediseno-visual.spec.ts:46` (se conforma con
// el prefijo `tel:`). El segundo ejemplo que esta nota citaba —el literal
// 'tel:+34918511393' de `PieDePagina.test.tsx`— ya no existe: el enlace de
// urgencias del pie se retiró el 20/09/2026 con la feature 39. El inventario
// de RUTAS sí sigue siendo el literal a mano de `rutas.ts`, como manda ese
// fichero.
//
// ESTE FICHERO SIRVE A DOS CONTRATOS DESDE EL 21/09/2026, y conviene saberlo
// antes de tocarlo: @s14 de `features/rediseno_visual.feature` (la CORRECCIÓN
// de toda mención que exista, más los disparadores de textos y enlaces) y @s1
// de `features/retirada_carteleria_urgencias.feature` (el TERCER censo: los
// rótulos accesibles, que hasta hoy nadie fijaba). Los tres censos salen del
// mismo recorrido y del mismo recolector: separarlos en dos specs costaría un
// segundo recorrido de las seis rutas para medir lo mismo.
//
// QUÉ COMPRUEBA ESTE FICHERO DESDE EL 20/09/2026, y qué dejó de comprobar:
// @s14 pasó de exigir PRESENCIA por ruta a exigir solo CORRECCIÓN. Ya no se
// vigila que el teléfono de urgencias esté publicado y alcanzable sin
// interactuar —eso no lo vigila nadie—; se vigila que toda mención que exista
// lleve el rótulo real y su `tel:` derivado del número real, y que el recuento
// de menciones estáticas siga siendo 0.
import { expect, test } from 'playwright/test'
import { datosNegocio } from '../../src/lib/site'
import { enlaceLlamada } from '../../src/lib/telefono'
import { RECUENTO_DE_RUTAS, RUTAS_DEL_INVENTARIO } from './rutas'

const ANCHO_ESCRITORIO = 1600
const ALTO_ESCRITORIO = 1000

const { telefonoUrgencias, telefonoClinica, telefonoMovil } = datosNegocio

/** El rótulo real del cliente, leído de la fuente única (`src/lib/site.ts:13`). */
const ROTULO_DE_URGENCIAS = telefonoUrgencias.rotulo ?? ''

/**
 * El `tel:` esperado NO se escribe: se DERIVA aquí del número visible con la
 * misma función del repositorio (`src/lib/telefono.ts:40`). Así, si mañana
 * cambia el teléfono en la fuente única y algún componente lo tiene retipeado,
 * este spec se pone rojo.
 */
const ENLACE_ESPERADO = enlaceLlamada(telefonoUrgencias.textoVisible)

interface MencionDeUrgencias {
  readonly textos: readonly string[]
  readonly etiquetas: readonly string[]
  readonly enlaces: readonly { readonly href: string; readonly nombre: string }[]
  readonly enlacesTelefonicos: number
}

/**
 * Recorre el DOM real de la página y devuelve TODO lo que menciona
 * "urgencias": los nodos de texto, los rótulos accesibles y los enlaces de
 * llamada asociados. No se usa ningún selector escrito a mano de componente:
 * el When del escenario dice "se recorre el TEXTO de las seis rutas buscando
 * la palabra urgencias", así que se busca por texto, no por caja.
 */
function recogerMenciones(): MencionDeUrgencias {
  const PATRON_URGENCIAS = /urgencias/i
  const ETIQUETAS_SIN_TEXTO_VISIBLE = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'])

  const textos: string[] = []
  const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let nodo = recorrido.nextNode(); nodo !== null; nodo = recorrido.nextNode()) {
    const etiquetaDelPadre = nodo.parentElement?.tagName ?? ''
    const texto = (nodo.textContent ?? '').trim()
    if (!ETIQUETAS_SIN_TEXTO_VISIBLE.has(etiquetaDelPadre) && PATRON_URGENCIAS.test(texto)) {
      textos.push(texto)
    }
  }

  const etiquetas = [...document.querySelectorAll('[aria-label]')]
    .map((elemento) => elemento.getAttribute('aria-label') ?? '')
    .filter((etiqueta) => PATRON_URGENCIAS.test(etiqueta))

  const enlacesTelefonicos = [...document.querySelectorAll('a[href^="tel:"]')]
  const enlaces = enlacesTelefonicos
    .map((enlace) => {
      const propia = enlace.getAttribute('aria-label') ?? enlace.textContent ?? ''
      const contenedor = enlace.closest('[aria-label]')?.getAttribute('aria-label') ?? ''
      return { href: enlace.getAttribute('href') ?? '', nombre: `${propia} ${contenedor}`.trim() }
    })
    .filter((enlace) => PATRON_URGENCIAS.test(enlace.nombre))

  return { textos, etiquetas, enlaces, enlacesTelefonicos: enlacesTelefonicos.length }
}

test.describe('@s14: toda mención de urgencias del sitio es la real, con el teléfono real', () => {
  test('los tres teléfonos de la fuente única son distintos entre sí', () => {
    // Sin esto, "el teléfono no es el de la clínica ni el móvil" sería una
    // comprobación vacía: pasaría sola si los tres números coincidieran.
    const enlaces = [ENLACE_ESPERADO, enlaceLlamada(telefonoClinica.textoVisible), enlaceLlamada(telefonoMovil.textoVisible)]

    expect(new Set(enlaces).size).toBe(3)
    expect(ROTULO_DE_URGENCIAS).not.toBe('')
  })

  test('toda mención de urgencias que aparezca en las seis rutas lleva el dato real, y hoy no aparece ninguna — @s1 de retirada_carteleria_urgencias: tampoco rotulada para quien no mira la pantalla', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: ALTO_ESCRITORIO })

    let rutasRecorridas = 0
    let mencionesTotales = 0
    let rotulosAccesiblesTotales = 0
    let enlacesDeUrgenciaComprobados = 0

    for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')

      const menciones = await page.evaluate(recogerMenciones)
      rutasRecorridas += 1

      // NO se exige presencia por ruta desde el 20/09/2026 (@s14 enmendado):
      // una ruta sin ninguna mención de urgencias ya no hace fallar nada. Lo
      // que sigue exigiéndose, íntegro, es la CORRECCIÓN de lo que aparezca.
      mencionesTotales += menciones.textos.length

      for (const texto of menciones.textos) {
        // El rótulo que aparece es EXACTAMENTE el de la fuente única.
        expect(texto, `${pagina}: texto de urgencias sin el rótulo real`).toContain(ROTULO_DE_URGENCIAS)
        // Y el número que lo acompaña no es el de la clínica ni el móvil.
        expect(texto).not.toContain(telefonoClinica.textoVisible)
        expect(texto).not.toContain(telefonoMovil.textoVisible)
      }

      // @s1 de `features/retirada_carteleria_urgencias.feature`: el TERCER
      // censo. El bucle de corrección de abajo es correcto y se queda, pero
      // desde el 20/09/2026 recorre una lista vacía en las seis rutas: sin
      // este acumulador es un `for` que nunca entra, y un test que pasa sobre
      // una lista vacía no es una puerta.
      rotulosAccesiblesTotales += menciones.etiquetas.length

      for (const etiqueta of menciones.etiquetas) {
        expect(etiqueta, `${pagina}: rótulo accesible de urgencias distinto del real`).toBe(ROTULO_DE_URGENCIAS)
      }

      // Tampoco se exige que la ruta publique un enlace de llamada: el bucle
      // recorre los que haya, y si no hay ninguno no comprueba ninguno.
      for (const enlace of menciones.enlaces) {
        // Derivado del número visible con la función del repositorio, no retipeado.
        expect(enlace.href, `${pagina}: el enlace de urgencias no deriva del número real`).toBe(ENLACE_ESPERADO)
        expect(enlace.href).not.toBe(enlaceLlamada(telefonoClinica.textoVisible))
        expect(enlace.href).not.toBe(enlaceLlamada(telefonoMovil.textoVisible))
        enlacesDeUrgenciaComprobados += 1
      }
    }

    // Anti-vacuidad que SÍ sobrevive: el recorrido recorre exactamente las
    // seis rutas del inventario, nunca una lista vacía.
    expect(rutasRecorridas).toBe(RECUENTO_DE_RUTAS)
    expect(rutasRecorridas).toBe(6)

    // DISPARADOR de @s14 (20/09/2026). Pablo ratificó que el teléfono de
    // urgencias deja de publicarse de forma ESTÁTICA en las seis rutas, y el
    // recuento queda fijado en 0 para que el cambio de política no pueda
    // volver en silencio: si alguien reintroduce el rótulo en el armazón
    // común, estas dos aserciones se ponen rojas y obligan a volver a la
    // puerta humana. Medido en Chromium sobre `dist/` servido, sin
    // interactuar: 0 menciones y 0 enlaces de llamada a urgencias. El dato NO
    // desaparece del sitio: reaparece al abrir la pregunta del FAQ (como
    // enlace, sin el rótulo), al elegir la urgencia en el chat (la palabra,
    // sin el rótulo) y en la confirmación del formulario (el rótulo entero).
    // Nada de eso lo ve este escenario, cuyo When prohíbe interactuar.
    expect(mencionesTotales).toBe(0)
    expect(enlacesDeUrgenciaComprobados).toBe(0)

    // DISPARADOR de @s1 de `features/retirada_carteleria_urgencias.feature`,
    // el TERCER censo y el único que no fijaba nadie. Los dos disparadores de
    // arriba cubren el texto visible y los enlaces de llamada; el nombre
    // accesible solo lo prohíbe `fidelidad_cabecera` @s5, y SOLO dentro de la
    // cabecera. Sin esta línea, un `aria-label` de cartelería en el cuerpo de
    // la página —exactamente el rótulo real, sobre un elemento que no es un
    // `tel:`— atravesaría las dos puertas sin aparecer en ningún recuento: era
    // el `fieldset` de la tarjeta de contacto (E1) y antes el control de la
    // cabecera (D1).
    //
    // Medido en Chromium sobre `dist/` servido, sin interactuar. El 0 no es el
    // de una página en blanco: el 21/09/2026 el recolector filtraba 84 rótulos
    // accesibles reales en las seis rutas ("Navegación principal", "Filtrar por
    // categoría"…) y ninguno decía "urgencias". Mordiente comprobada el mismo
    // día invirtiendo esta afirmación a 1: la puerta falla con "Expected: 1,
    // Received: 0" (`progress/tdd_39_oleada6_rotulos_accesibles.md`).
    expect(
      rotulosAccesiblesTotales,
      'rótulos accesibles que mencionan "urgencias" en las seis rutas, sin interactuar',
    ).toBe(0)
  })
})
