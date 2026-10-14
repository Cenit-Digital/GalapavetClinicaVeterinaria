# TDD — feature 48 `hero_reducido_con_animacion` (índice consolidado)

> `craftsman_lead`, 14/10/2026. Este fichero es el ÍNDICE que piden el `judge` y el
> `mutation_tester` (`progress/tdd_<name>.md`). El detalle de cada ciclo
> Rojo → Verde → Refactor, cada sabotaje y cada desvío vive en el informe de su ola; aquí
> están la secuencia, el mapa «escenario → dónde se prueba» y el estado de las puertas.

## 1. Las olas (cada una la hizo un `tdd_craftsman`, con ficheros disjuntos)

| Ola | Qué | Informe | Commit |
| --- | --- | --- | --- |
| 1A | Retirada del contenido del hero, altura de pantalla completa, pruebas de navegador de la portada | `tdd_hero_reducido_con_animacion_olaa.md` | `eee6be7` |
| 1B | Puertas de movimiento (escala, «solo dentro de no-preference», inventario de accesibilidad, comprobación estática de @s10) y lector de hojas compartido | `tdd_hero_reducido_con_animacion_olab.md` | `eee6be7` |
| 2A | La animación real (`Hero.module.scss`) y sus pruebas de navegador con el reloj congelado | `tdd_hero_reducido_con_animacion_ola2a.md` | `5baf8ce` |
| 2B | Ayudante `esperarEntradaTerminada`, su cableado a los specs reales, CLS de la entrada, accesibilidad @s19/@s22, adaptación de los specs | `tdd_hero_reducido_con_animacion_ola2b.md` | `5baf8ce` |
| 3A | Prueba y medida de LCP (@s11) | `tdd_hero_reducido_con_animacion_ola3a.md` + `lcp_hero_despues_20261014.md` | (ver `git log`) |
| 3B | Comentarios que quedaron falsos tras retirar el contenido del hero (solo comentarios) | `tdd_hero_reducido_con_animacion_ola3b.md` | (ver `git log`) |

Verificación conjunta del `craftsman_lead` tras cada ola (los agentes de una misma ola
trabajan en paralelo: sus verdes individuales no bastan): lint 0, `tsc -b` 0,
`tsc -p tsconfig.e2e.json` 0, Vitest y `pnpm run test:e2e`, y réplica del CI en una copia
limpia (instalar, construir, `harness init`, `test:config`) antes de cada `push`.

## 2. Mapa escenario → dónde se prueba

Los nombres exactos de cada test están en el informe de la ola que se indica.

### `features/hero_reducido_con_animacion.feature`

| @s | Qué exige | Dónde (fichero) | Informe |
| --- | --- | --- | --- |
| @s1 | Exactamente titular, párrafo y un botón, a la izquierda | `src/components/Hero.test.tsx`, `tests/e2e/fidelidad-hero.spec.ts` | 1A |
| @s2 | Los datos retirados siguen publicados en el resto de la portada | `tests/e2e/hero-reducido.spec.ts` | 1A |
| @s3 | El código que solo servía a lo retirado desaparece | `src/components/Hero.test.tsx` | 1A |
| @s4 | Lint, tipos, build, pruebas, navegador y mutación limpios | `pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run test:e2e`, `bin/harness init`; mutación: `mutation_hero_reducido_con_animacion.md` | lead + `mutation_tester` |
| @s5 | Los tres elementos entran con los valores aprobados | `tests/e2e/hero-reducido.spec.ts` (con el reloj congelado antes de navegar), `src/components/Hero.test.tsx` (lectura de la hoja) | 2A |
| @s6 | Con movimiento reducido no se anima nada | `tests/e2e/hero-reducido.spec.ts` | 2A |
| @s7 | Sin animación todo queda visible y en su sitio | `tests/e2e/hero-reducido.spec.ts` | 2A |
| @s8 | Declaraciones de animación solo dentro de `no-preference` (20 hojas) | `src/lib/diseno/movimientoRespetuoso.test.ts`, `src/components/Hero.test.tsx` | 1B + 2A (guardas `> 0`) |
| @s9 | Sin barra horizontal, sin mover el resto y CLS ≤ 0,1 | `tests/e2e/hero-reducido.spec.ts` (tres instantes × tres anchos), `tests/e2e/hero-entrada-cls.spec.ts` (CLS sin congelar, 6 rutas) | 2A + 2B |
| @s10 | Todo test que mide la portada recién cargada espera o emula `reduce` | `src/lib/diseno/medicionEstable.test.ts` (tabla), `src/lib/diseno/medicionEstableSpecsReales.test.ts` (specs reales), `tests/e2e/esperar-entrada-terminada.spec.ts` (el ayudante contra páginas sintéticas) | 1B + 2B |
| @s11 | LCP antes/después, mediana ≤ 2500 ms | `tests/e2e/lcp-hero.spec.ts`, `progress/lcp_hero_despues_20261014.md` | 3A |
| @s12 | Altura de pantalla completa y contenido centrado | `src/components/Hero.test.tsx` (CSS), `tests/e2e/hero-reducido.spec.ts` (navegador, reloj congelado) | 1A + 2A |

### Enmiendas en otros `.feature`

| Escenario | Dónde | Informe |
| --- | --- | --- |
| `hero` @s1, @s2, @s3, @s7, @s8, @s13, @s14 (los @s4, @s5, @s6, @s9, @s10, @s11 se retiran) | `src/components/Hero.test.tsx`, `tests/e2e/fidelidad-hero.spec.ts` | 1A |
| `fidelidad_hero` @s1, @s2, @s3 | `tests/e2e/fidelidad-hero.spec.ts` | 1A |
| `rediseno_visual` @s18, @s33 (@s30 y @s51 retirados; @s29 sin cambio) | `src/components/Faq.test.tsx`, `tests/e2e/fidelidad-hero.spec.ts` | 1A |
| `accesibilidad` @s19, @s22 | `tests/e2e/movimiento.spec.ts` | 2B |
| `accesibilidad` @s20 (@s21 revisado sin cambio) | `src/lib/accesibilidad-movimiento.test.ts` (+ guardas `> 0` de 2A) | 1B + 2A |
| `identidad_visual` @s16 | `src/lib/diseno/escalaMovimiento.test.ts` | 1B |
| `identidad_visual` @s23 | `tests/e2e/tipografia.spec.ts` | 1A |

## 3. Estado de las puertas (medido por el lead, 14/10/2026 08:30, con la máquina en reposo)

- `pnpm run lint` → salida 0 · `pnpm run typecheck` → 0 · `tsc -p tsconfig.e2e.json --noEmit` → 0.
- `pnpm test` → 90 ficheros, **1748 pruebas** en verde.
- `pnpm run test:e2e` → **267 pruebas** en verde (salida 0), con la animación presente.
- LCP con la máquina en reposo (`progress/lcp_hero_despues_20261014.md` §10): escritorio 116 y 128 ms frente a 132 ms de la línea base local; móvil 96 y 104 ms frente a 120 ms; la foto sigue siendo el candidato en las 20 pasadas y el CLS es 0.
- Mutación (`StrykerJS`, umbral 100 % sobre los mutantes no equivalentes): **pendiente**, la ejecuta el `mutation_tester` DESPUÉS de la aprobación del `judge`.

## 4. Puntos abiertos que el `judge` debe mirar

1. **«Las tres empiezan en el mismo instante» (@s5)** no se puede probar con el reloj congelado
   (`startTime` vale 0 para todas por construcción). La ola 2A lo deja como cláusula DOCUMENTAL.
2. **La ventana de observación de @s11** (`networkidle` + 1,5 s, ≈ 2 s tras navegar) no ve un
   retardo de entrada de 3 s: la cláusula «mediana ≤ 2500 ms» solo salta si el candidato llega
   a observarse. No afecta a la 48 (el candidato es la foto); **la 49 necesita un suelo de
   observación** y eso es un cambio de contrato a presentar a Pablo con ella.
3. **Las vías (a) y (b) de @s10 no miden el mismo estado cuando se mide el FOCO** (con `reduce`
   la regla global deja `transition-duration: 0.01ms` y el color del contorno se lee a medio
   camino: ratio 1,12). Por eso `accesibilidad` @s38/@s39 van por la vía (a) solo en la portada.
4. **La comprobación estática de @s10 alcanza a 6 ficheros, no a los 4 del contrato**
   (`fidelidad.spec.ts` @s43 y `hero-reducido.spec.ts` entran además): dato, no defecto.
5. **Excepción por etiqueta de `cabecera_sobre_el_hero`** sin implementar en `medicionEstable.ts`
   (los specs de la 49 aún no existen): se arrastra a la 49.
6. **Intermitencia observada una vez** en `src/accesibilidad-teclado.test.tsx` durante una ejecución
   completa de Vitest con otro agente midiendo en paralelo (5 pruebas: el tabulador acababa en
   `body`); pasa sola y en las ejecuciones completas posteriores del lead. Causa no demostrada.
7. **Puerta humana pendiente (@s11):** el visto bueno de Pablo sobre las cifras de LCP antes de
   cerrar la 48 (el informe de LCP lo dice; el lead se lo presenta).
