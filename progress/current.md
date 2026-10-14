# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

## Feature en curso: 48 — hero_reducido_con_animacion  (13/10/2026)

Contrato FIRMADO por Pablo el 13/10/2026: features/hero_reducido_con_animacion.feature (@s1..@s12) y las
enmiendas en hero, fidelidad_hero, rediseno_visual, accesibilidad e identidad_visual (tabla en
progress/gherkin_48_resumen.md §2). Especificacion y decisiones: progress/decisiones_cabecera_hero_20261013.md.
La 49 (cabecera_sobre_el_hero) queda spec_ready: NO se toca hasta cerrar la 48.

Olas (cada agente escribe SOLO su informe progress/tdd_hero_reducido_con_animacion_ola<X>.md; current.md lo mantiene el craftsman_lead):
- Ola 1A  retirada del contenido del hero + altura a pantalla completa (Hero.*, datosDelSitio, Hero-logica, tests unitarios y fidelidad-hero.spec)
          HECHA (14/10/2026): informe progress/tdd_hero_reducido_con_animacion_olaa.md
- Ola 1B  puertas de movimiento (escalaMovimiento, movimientoRespetuoso, accesibilidad-movimiento y sus tests)
          HECHA (14/10/2026): informe progress/tdd_hero_reducido_con_animacion_olab.md (estado parcial: lo que falta es de la ola 2)
          Verificacion conjunta del lead: lint 0, tsc 0, vitest 1716/1716 (89 ficheros), test:e2e 185/185 con 4173 libre; vista real a 1440x900 y 375x812 comprobada.
- Ola 2   animacion real + pruebas de navegador (@s5 @s6 @s7 @s9 @s10 @s12; @s11 pasa a la ola 3a)
          HECHA (14/10/2026): informes progress/tdd_hero_reducido_con_animacion_ola2a.md (animacion + specs del hero) y ola2b.md (ayudante esperarEntradaTerminada, cableado de @s10, @s9 CLS, accesibilidad @s19/@s22).
          Verificacion conjunta del lead: lint 0, tsc 0 (y tsconfig.e2e 0), vitest 1748/1748 (90 ficheros), test:e2e 247/247 con la animacion presente.
- Ola 3a  A: prueba y medida de LCP (@s11) + informe lcp_hero_despues_20261014.md; B: comentarios falsos tras retirar el hero (solo comentarios)
          HECHA (14/10/2026): informes progress/tdd_hero_reducido_con_animacion_ola3a.md y ola3b.md; indice consolidado progress/tdd_hero_reducido_con_animacion.md.
          Verificacion del lead con la maquina en reposo: lint 0, tsc 0 (x2), vitest 1748/1748 (90 ficheros), test:e2e 267/267, LCP escritorio 116 y 128 ms frente a 132 (linea base local), movil 96 y 104 frente a 120.
- Panel   revision de la 48 sobre 2267262 (judge + 4 revisores): CHANGES_REQUESTED (2 bloqueantes y 13 importantes en las puertas nuevas; el judge solo pedia documentacion). Informe: progress/judge_hero_reducido_con_animacion.md (ronda 1)
- Ola 4   HECHA (14/10/2026): 4A comprobacion estatica de @s10, 4B lector de hojas y puertas de movimiento, 4C specs, forbidOnly y comentarios. Stryker acotado 100 % en los 5 modulos, 0 Timeout. Verificacion del lead: lint 0, tsc 0 (x2), vitest 2388/2388 (90 ficheros), test:e2e 278/278.
- Ola 5   judge (segunda ronda, sobre el delta), despues mutation_tester oficial sobre el estado final, puerta humana de LCP (Pablo) y cierre de la 48
- Ola 3   cierre: harness init, test:e2e, mutacion, juez, informe LCP, despliegue
