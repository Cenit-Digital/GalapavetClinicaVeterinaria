# TDD — Feature 39, oleada 6: el tercer censo (rótulos accesibles)

**Escenario:** `@s1` de `features/retirada_carteleria_urgencias.feature`
— «Ninguna de las seis rutas rotula urgencias para quien no mira la pantalla».
**Fecha:** 21/09/2026. **Fichero tocado:** `tests/e2e/urgencias.spec.ts` (único).
**Producción tocada:** NINGUNA. El escenario nació en verde, como el contrato
preveía; no hubo nada que implementar en `src/`, y por la Ley 1 no se escribió
nada allí.

---

## 1. Ciclo Rojo-Verde-Refactor

El escenario es un DISPARADOR sobre un estado que ya se cumple, así que el rojo
no podía venir de la producción: vino de la propia afirmación, escrita invertida
a propósito. Es el mismo rojo que exige la última cláusula del escenario
(«invertida la afirmación a 1, la puerta falla»), y se hizo PRIMERO para no
declarar verde nada que no se hubiera visto fallar antes.

| Paso | Qué se hizo | Resultado medido |
| ---- | ----------- | ---------------- |
| ROJO | Acumulador `rotulosAccesiblesTotales += menciones.etiquetas.length` en el bucle de las seis rutas + afirmación **invertida a 1** | `PLAYWRIGHT_EXIT=1`, «Expected: 1 / Received: 0» |
| VERDE | La afirmación pasa a `toBe(0)`. Sin cambios en `src/` | `PLAYWRIGHT_EXIT=0`, 2 passed |
| REFACTOR (en verde) | Cabecera del fichero: declara que sirve a DOS contratos (@s14 de `rediseno_visual` y @s1 de este). Título del test 2: cita `@s1` para que el mapa sea greppable. Comentario del disparador: por qué el hueco existía y cuál fue la medición | `PLAYWRIGHT_EXIT=0`, 2 passed; lint y typecheck en verde |
| RE-VERIFICACIÓN | Se volvió a invertir a 1 **sobre el fichero ya refactorizado** y se restauró, para que el fallo capturado corresponda al código tal y como queda | `PLAYWRIGHT_EXIT=1` y luego `0` |

Lo que NO se hizo, por la Ley 3: no se tocó el bucle de corrección de
`etiquetas` (es correcto y el contrato lo manda conservar), no se añadió un spec
nuevo (el recorrido, el recolector y la guarda de rutas ya existían), y no se
adelantó nada de otros escenarios.

---

## 2. El fallo LITERAL al invertir el disparador

Ejecutado sobre el fichero final, con el disparador puesto a `1`:

```
  1) tests\e2e\urgencias.spec.ts:113:3 › @s14: toda mención de urgencias del sitio es la real, con el teléfono real › toda mención de urgencias que aparezca en las seis rutas lleva el dato real, y hoy no aparece ninguna — @s1 de retirada_carteleria_urgencias: tampoco rotulada para quien no mira la pantalla

    Error: rótulos accesibles que mencionan "urgencias" en las seis rutas, sin interactuar

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      201 |       rotulosAccesiblesTotales,
      202 |       'rótulos accesibles que mencionan "urgencias" en las seis rutas, sin interactuar',
    > 203 |     ).toBe(1)
          |       ^
      204 |   })
      205 | })
        at C:\...\tests\e2e\urgencias.spec.ts:203:7
```

`PLAYWRIGHT_EXIT=1`. Restaurado a `toBe(0)` acto seguido: `PLAYWRIGHT_EXIT=0`.

El «Received: 0» es, además, la propia medición: el número sale del acumulador
tras recorrer las seis rutas, no de una constante.

---

## 3. La medición REAL en navegador (no deducida del contrato)

Chromium (`Desktop Chrome`, 1600x1000) sobre `dist/` construido y servido por
`vite preview --base=/GalapavetClinicaVeterinaria/` en el puerto 4173, sin
interactuar con ninguna página.

**Resultado: 0 rótulos accesibles con «urgencias» en las seis rutas.** El
escenario NACE EN VERDE, como el contrato anticipaba. No hay hallazgo que
devolver a la puerta humana por este lado.

### 3.1 Y el 0 no es el de una página en blanco

La vacuidad que este escenario persigue tiene dos caras: la afirmación que no
puede ponerse roja (resuelta en §2) y el censo que mide sobre la nada. Para
descartar la segunda se midió, fuera del spec y sin dejar rastro en el
repositorio, el UNIVERSO que el recolector filtra:

| Ruta | `[aria-label]` en el documento | Con «urgencias» | Nodos en `body` |
| ---- | ------------------------------ | --------------- | --------------- |
| Landing | 33 | 0 | 371 |
| Campañas | 9 | 0 | 110 |
| Ficha de campaña | 9 | 0 | 125 |
| Blog | 9 | 0 | 129 |
| Artículo del blog | 7 | 0 | 103 |
| Tienda | 17 | 0 | 144 |
| **Total** | **84** | **0** | — |

Muestra de lo que sí hay: «Galapavet: Centro integral veterinario»,
«Navegación principal», «Filtrar por categoría», «Enlaces legales», «Aviso legal
(se abre en una ventana nueva)». Es decir: **0 sobre 84 rótulos reales**, en seis
documentos que renderizaron de verdad. El censo ve, y lo que ve no dice
«urgencias».

---

## 4. Trazabilidad @s → test

Una sola línea de test cubre el escenario; las otras tres cláusulas son guardas
de anti-vacuidad que ya vivían en el mismo test y ahora también le sirven.

| Cláusula de @s1 | Dónde se muerde |
| --------------- | --------------- |
| Given: sitio construido y servido, seis rutas publicadas | `playwright.config.ts` → `webServer` (`vite preview` sobre `dist/`) + bucle sobre `RUTAS_DEL_INVENTARIO` |
| When: recorrer el documento entero sin interactuar, recogiendo rótulos accesibles | `recogerMenciones()` → `document.querySelectorAll('[aria-label]')` filtrado por `/urgencias/i`, dentro de `page.evaluate` |
| Then: el recuento total es exactamente 0 | `expect(rotulosAccesiblesTotales, '…').toBe(0)` |
| And: sale del documento real, nunca de una lista del test | el acumulador suma `menciones.etiquetas.length`, que procede del DOM real; no hay literal de rótulos en el spec |
| And: recorre exactamente las seis rutas, nunca una lista vacía | `expect(rutasRecorridas).toBe(RECUENTO_DE_RUTAS)` y `.toBe(6)` (ya existían; se ejecutan ANTES del disparador nuevo, así que el 0 se declara sobre seis rutas confirmadas) |
| And: el 0 es un disparador con mordiente comprobada | §2 de este informe |

**Test concreto:** `tests/e2e/urgencias.spec.ts` → describe `@s14: toda mención de
urgencias del sitio es la real, con el teléfono real` → test `… — @s1 de
retirada_carteleria_urgencias: tampoco rotulada para quien no mira la pantalla`.

El test sirve a dos contratos a la vez (@s14 de `rediseno_visual` y @s1 de este)
porque los tres censos salen del MISMO recorrido y del MISMO recolector. Un spec
aparte habría costado un segundo recorrido de las seis rutas para medir lo mismo.
Queda dicho en la cabecera del fichero para que nadie lo descubra por sorpresa.

---

## 5. Puertas al cerrar

| Puerta | Comando | Código de salida |
| ------ | ------- | ---------------- |
| Lint | `pnpm run lint` | **0** |
| Typecheck | `pnpm run typecheck` | **0** |
| Navegador | `pnpm exec playwright test tests/e2e/urgencias.spec.ts` | **0** — 2 passed |
| Arnés | `node .harness/harness.mjs init` | **0** — 1422 tests de Vitest en verde, ningún `[FAIL]` |

Los códigos de salida se midieron SIN tubería (`cmd > fichero 2>&1; echo $?`),
no con `| tail`, que devolvería el del último comando de la tubería.

---

## 6. Dos incidencias de entorno que el lead debe conocer

1. **`pnpm run typecheck` estuvo en rojo al empezar la oleada**, por
   `tests/e2e/movimiento.spec.ts(26,16): error TS6133: 'instalarLectorDeDuraciones'
   is declared but its value is never read` — fichero del otro artesano, en mi
   lista de prohibidos. Como `pnpm run build` empieza por `tsc -b`, eso
   impedía arrancar el `webServer` de Playwright. Se sorteó construyendo
   `dist/` con `vite build` + la puerta de terceros (sin el `tsc -b` ajeno) y
   reutilizando el `vite preview` ya escuchando en 4173. Al cerrar, el otro
   artesano ya lo había arreglado: typecheck y `harness init` verdes. **No se
   tocó ninguno de sus ficheros.**

2. **Git Bash mangla `--base=/GalapavetClinicaVeterinaria/`**: la conversión de
   rutas de MSYS lo convirtió en `/Program Files/Git/GalapavetClinicaVeterinaria/`
   y el `dist/` resultante apuntaba los assets ahí (`vite` avisa con «"base"
   option should start with a slash»). Se corrige con `MSYS_NO_PATHCONV=1`.
   Afecta a cualquiera que lance el build a mano desde Bash en Windows; el
   `webServer` de Playwright no lo sufre porque lo lanza Node, no el shell.

---

## 7. Lo que este ciclo NO cierra

- `@s19` y `@s20` de `accesibilidad.feature` siguen siendo el hueco vivo que
  `progress/judge_39.md` §8.2 señala. No son de este escenario ni de este
  fichero.
- `MencionDeUrgencias.enlacesTelefonicos` (el recuento del universo de
  `a[href^="tel:"]`) sigue **declarado y sin usar** en el spec: es la misma
  guarda de universo que en §3.1 se midió a mano para los rótulos. No se cableó
  porque ninguna cláusula de @s1 lo pide y la Ley 3 lo prohíbe. Queda apuntado
  por si el lead quiere una oleada acotada para ello.
