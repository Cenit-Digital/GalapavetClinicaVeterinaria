# Reparación de features/accesibilidad.feature contra VEREDICTO_accesibilidad.md

Fuente: `progress/revision/VEREDICTO_accesibilidad.md` (13 hallazgos CONFIRMADO).
Solo se tocan las filas CONFIRMADO; las 4 REFUTADO (@s16, @s24, @s29, @s30-umbral-genérico)
no se tocan.

## Hallazgos CONFIRMADO atendidos (13/13)

1. **@s2 (bloqueante, L1 — target-size de axe exige layout real)**
   Línea ~176: añadida cláusula `And esta verificación se ejecuta con navegador
   real (Claude in Chrome / skill browser-automation), fuera del gate de
   Vitest/Stryker, según la Decisión 11...`. Documentado también en la nueva
   sección de cabecera "QUÉ SE VERIFICA CON NAVEGADOR REAL..." (líneas 111-124).

2. **@s10 (grave, L1 — ambigüedad "declarada" vs "medida")**
   Línea ~255: añadida cláusula que ancla el origen del valor: "esa área sale
   de un valor declarado en el módulo puro que calcula el layout de cada
   control (Invariante 6), no de una medición del render". Reforzado en la
   cabecera (líneas 120-124), mismo patrón que ya usaba @s29 para color.

3. **@s17 (bloqueante, L1 — geometría de foco tapado)**
   Línea ~318: añadida cláusula de navegador real (misma fórmula que @s2),
   con motivo específico: "depende del rectángulo real de la cabecera fija y
   del control".

4. **@s18, mitad geometría/contraste de píxeles (bloqueante, L1)**
   Línea ~327: añadida cláusula de navegador real, motivo: "exige píxeles
   efectivamente renderizados en dos estados".

5. **@s18, guarda de conteo (grave, L3 — verde por vacuidad)**
   Línea ~332: añadida `And el recuento de controles a los que se comprobó el
   área y el contraste del indicador de foco es mayor que 0` (mismo patrón que
   @s16). Resuelto en la misma pasada que el punto 4 porque tocaban el mismo
   escenario.

6. **@s19 (bloqueante, L1 — animación CSS en curso exige motor de animación real)**
   Línea ~341: añadida cláusula de navegador real, motivo: "exige interrogar
   el motor de animaciones CSS con las hojas de estilo aplicadas".

7. **@s20 y @s21 (grave, L3 — universal sin recuento sobre contenido animado)**
   Línea ~355 (@s20): añadida `And el recuento de bloques que en condiciones
   normales aparecen mediante una animación es mayor que 0`.
   Línea ~364 (@s21): añadida `And el recuento de elementos comprobados es
   mayor que 0` (mismo patrón que @s19).

8. **@s27 (grave, L3 — universal sin recuento positivo de paradas en cabecera)**
   Línea ~418: añadida `And el recuento de paradas en los controles de
   cabecera es mayor que 0`, antes del recuento-cero de paneles colapsados que
   ya existía.

9. **@s13 y @s14 (grave, L3 — 3 de las 5 excepciones de SC 2.5.8 sin ejercitar)**
   Líneas 30-36 (cabecera, tras la cita literal de las 5 excepciones): añadido
   bloque "ALCANCE DE ESTE PROYECTO" que acota explícitamente que el módulo
   puro solo implementa Spacing (@s14) e Inline (@s13); Equivalent, User Agent
   Control y Essential quedan fuera de alcance y no deben tener rama de
   decisión en el módulo, para no dejar superficie mutable sin escenario.

10. **@s30, guarda de conteo (bloqueante, L3)**
    Línea ~452: añadida `And el recuento de parejas efectivamente calculadas
    es mayor que 0` (mismo patrón que @s29/@s31).

11. **CABECERA — lógica fuera de la superficie mutable (bloqueante, L3)**
    Líneas 126-133: nueva sección "DÓNDE VIVE LA LÓGICA DE ESTA PUERTA" que
    exige explícitamente que el inventario, los umbrales anclados y el
    veredicto vivan en `src/lib/**/*.ts` o `*-logica.ts` (Invariante 6),
    citando que `stryker.config.json` limita `mutate` a esos globs.

12. **@s32 (bloqueante, L3 — falta el lado de aprobación exacta de los umbrales)**
    Resuelto en dos partes, en la misma zona del fichero:
    - Tamaños de texto grande: añadidas dos cláusulas a @s30 (líneas 450-451)
      que prueban el lado de aprobación exacta (24 px sin negrita, 18.66 px
      negrita SÍ se clasifican como texto grande), junto a las que ya probaban
      el lado de rechazo (23 px, 18 px).
    - Ratios de contraste: nuevo escenario `@s34` (líneas 473-480) que prueba
      ratio == 4.5 (texto normal) y ratio == 3 (texto grande) como aprobados,
      cerrando el mutante `>=` → `>` que sobrevivía, análogo a @s11/@s12 de
      área táctil.

13. **@s33 (menor, L3 — un solo Given genérico para 3 inventarios de color independientes)**
    @s33 se dividió en tres escenarios independientes, uno por cada extractor
    de color del bloque F: `@s33` (texto normal, líneas 482-489), `@s35`
    (texto grande, líneas 491-498) y `@s36` (componentes de interfaz, líneas
    500-507). Actualizada la cabecera (líneas 81-93) para declarar "seis
    extractores independientes" en vez de cuatro y nombrar los tres nuevos
    tags, coherente con la regla que la propia cabecera ya se autoimponía
    ("la guarda va POR CADA EXTRACTOR INDEPENDIENTE").

## Hallazgos REFUTADO — no tocados

@s16, @s24, @s29, @s30 (umbral genérico ≥3): sus veredictos ya traen
justificación propia de por qué NO son defecto; no se ha modificado ninguna
línea relacionada con ellos.

## Resultado

- Escenarios totales: 33 → 36 (nuevos: `@s34`, `@s35`, `@s36`; `@s33` se
  redefinió sin cambiar su tag ni su posición relativa al bloque F).
- Ningún dato nuevo: todos los literales añadidos son consecuencia mecánica
  de los propios hallazgos (guardas de conteo, fronteras exactas ya presentes
  en la norma citada en la cabecera — 4.5, 3, 24, 18.66 — o citas a Decisión 11
  / Invariante 6 de `project-spec.md`).
