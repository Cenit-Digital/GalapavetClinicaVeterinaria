# Veredicto — features/cabecera_y_navegacion.feature (G2)

## Alegaciones recogidas

- **L1** (satisfacibilidad y mensurabilidad): 0 hallazgos sobre este fichero.
  El propio informe lo declara explícitamente: "formulario_contacto.feature y
  cabecera_y_navegacion.feature no presentaron hallazgos de esta lente".
- **L2** (fidelidad a la fuente primaria): 0 hallazgos en todo el lote G2
  ("Hallazgos (0)"), por tanto 0 sobre este fichero.
- **L3** (mutación y verde por vacuidad): 2 hallazgos sobre este fichero,
  `@s7` (grave) y `@s2` (menor).

**Total alegado sobre este fichero: 2.** Sin solapamiento entre lentes (las
únicas dos alegaciones proceden de L3 y versan sobre anclas distintas), así
que no hay duplicados que colapsar.

## Veredictos

| Ancla | Severidad | Veredicto | Motivo (cita propia) |
|---|---|---|---|
| `@s7` | grave | **REFUTADO** | La alegación (L3) exige repetir la tabla literal de `@s5` dentro de `@s7` porque compararlo relativamente con "los mismos que los de la navegación de escritorio" (línea 161) permitiría, con un panel duplicado en JSX, que sobreviva un mutante `StringLiteral/ArrayDeclaration` en la copia del panel. Pero `stryker.config.json` declara explícitamente el alcance mutable: `"mutate": ["src/lib/**/*.ts", "src/**/*-logica.ts", ...]` y el propio comentario del fichero dice por qué se excluye el `.tsx`: *"Los .tsx solo cablean, y StrykerJS no muta ni el texto ni los atributos de JSX (issue abierto stryker-mutator/stryker-js#4375)"*. El mutante `StringLiteral/ArrayDeclaration` "en la copia del panel" que la alegación describe solo podría generarse si esa copia viviera en un `.tsx` (nunca mutado, luego el riesgo no aplica) o en un módulo `.ts` propio y verdaderamente duplicado — contrario a la filosofía de fuente única que el propio fichero ya aplica al breakpoint (comentario 5: "si al medir hay que mover el valor, cambia UN literal en UN escenario"). Además, la implementación natural del Then (renderizar el panel y compararlo con el render real de escritorio, dos salidas de producción independientes) no es tautológica: cae en el supuesto que la propia memoria organizacional citada por L3 excluye explícitamente — `.memoria-cache/patterns/testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`, sección "Cuándo NO aplica": *"Constantes que no participan en el doble, sino que son la salida esperada que el test asevera [...] no crea tautología porque el doble no lo usa para fabricar la entrada"*. Por último, dos de los ocho destinos del panel (Servicios, Tienda) ya quedan anclados a literal de forma independiente en `@s9` ("el navegador queda situado en el destino \"#servicios\"") y `@s10` ("...\"/tienda\""), reduciendo aún más la superficie del riesgo alegado. Hay pues una lectura razonable — y coherente con las convenciones ya explícitas del propio fichero y del proyecto — bajo la cual esto no es un defecto. |
| `@s2` | menor | **REFUTADO** | La alegación (L3) dice que "nada en el contrato exige que la decisión de rama viva en un módulo puro .ts alcanzable por Stryker". Pero `project-spec.md` sí lo exige, como invariante de **todo el proyecto**, no solo de esta feature: Invariante 6, línea 64-65: *"La lógica de decisión vive en módulos puros (`*-logica.ts`), el `.tsx` solo cablea. Patrón `logica-de-decision-en-modulo-puro-no-en-el-jsx`."* Y el diagrama de arquitectura (línea 100) lo remacha: *"lógica pura (src/components/*-logica.ts, src/lib/) ← toda decisión mordible por mutación"*. La propia cabecera del `.feature` remite expresamente a `project-spec.md` como fuente de decisiones ("Decisiones: project-spec.md, Decisión 2"), así que ese invariante gobierna igual la decisión de rama de `@s1`-`@s3` sin necesidad de repetirlo dentro de cada `.feature` — exactamente el mismo principio anti-duplicación que el propio fichero aplica al valor del breakpoint. No repetir un invariante ya declarado a nivel de proyecto no es un hueco del contrato. |

## Resumen

- Total alegado: 2
- Confirmados: 0
- Refutados: 2
- Duplicados colapsados: 0
