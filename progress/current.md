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
- Ola 1B  puertas de movimiento (escalaMovimiento, movimientoRespetuoso, accesibilidad-movimiento y sus tests)
- Ola 2   animacion real + pruebas de navegador (@s5 @s6 @s7 @s9 @s10 @s11 @s12)
- Ola 3   cierre: harness init, test:e2e, mutacion, juez, informe LCP, despliegue
