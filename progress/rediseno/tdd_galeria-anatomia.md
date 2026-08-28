# TDD — lote `galeria-anatomia` (feature `rediseno_visual`, @s35)

## Contexto: reanudación tras interrupción de la oleada anterior

Este lote llega a mitad de ciclo: una oleada anterior de 12 `tdd_craftsman`
en paralelo se interrumpió (un agente violó la regla de no tocar `git` de
forma destructiva; el `craftsman_lead` recuperó el árbol de trabajo completo
desde `git stash` sin pérdida real). Al retomar, el estado real de
`Galeria.test.tsx` ya traía los tests de `@s35` escritos (incluida la
comprobación de `scroll-snap-type`/`scroll-snap-align` sobre el CSS crudo),
pero `Galeria.module.scss` había perdido la declaración `scroll-snap-type`
del contenedor `.pista` a medio refactor. Este informe documenta el ciclo
que cierra ese rojo real, no un ciclo desde cero.

## Ámbito cerrado de este lote

- `src/components/Galeria.tsx` — sin cambios (ya correcto).
- `src/components/Galeria-logica.ts` — sin cambios (ya correcto).
- `src/components/Galeria-logica.test.ts` — sin cambios (ya correcto).
- `src/components/Galeria.module.scss` — **modificado** (este ciclo).
- `src/components/Galeria.test.tsx` — sin cambios de contenido en este
  ciclo; ya traía los 5 tests de `@s35` de la oleada anterior, cubriendo
  además `@s1`–`@s17` (heredados de la implementación previa del componente,
  fuera de la anatomía del prototipo pero parte del mismo fichero).

## Estado de partida (rojo real confirmado)

`pnpm exec vitest run src/components/Galeria.test.tsx
src/components/Galeria-logica.test.ts`:

```
FAIL src/components/Galeria.test.tsx > @s35 ... > la pista declara anclaje
de desplazamiento (scroll-snap-type/scroll-snap-align)
AssertionError: expected '{\n  display: flex;\n  gap: espaciado…' to match
/scroll-snap-type:/
```

El bloque REAL de `.pista` (extraído del SCSS crudo vía `import.meta.glob`,
sin comentarios) no contenía ninguna declaración `scroll-snap-type:` — solo
`overflow-x: auto` y, en el hijo `figure`, `scroll-snap-align: start`. El
resto de la suite (29 tests) ya pasaba: 1 solo test en rojo.

## Ciclo ROJO → VERDE → REFACTOR

### ROJO (confirmado, no reescrito)

Test ya existente, `Galeria.test.tsx:405-410` (`@s35`, tercer `it` del
bloque): exige que el bloque de `.pista` contenga `scroll-snap-type:` y
`scroll-snap-align:`. Falló como se muestra arriba. No hizo falta escribir
un test nuevo: el que ya estaba en el fichero era la especificación exacta
del comportamiento que faltaba (doble anclaje: contenedor + hijo).

### VERDE (cambio mínimo de producción)

En `src/components/Galeria.module.scss`, dentro de `.pista`, se añadió:

```scss
scroll-snap-type: x mandatory;
```

Valor `x mandatory` (no `proximity` ni otro): es el valor real del
prototipo aprobado, verificado contra dos fuentes independientes de la
fuente de verdad del diseño:
- `docs/diseno-claude-design/Veterinaria La Sierra.dc.html:330` —
  `scroll-snap-type:x mandatory` en el `<div ref="{{ pistaGaleria }}">`.
- `progress/estudio_diseno_referencia.md:187` — tabla de anatomía de
  Galería: `overflow-x:auto` + `scroll-snap-type:x mandatory`.

Tras el cambio: `pnpm exec vitest run src/components/Galeria.test.tsx
src/components/Galeria-logica.test.ts` → **30/30 verde** (2 ficheros).

### REFACTOR

No aplicó refactor adicional: el cambio es una única declaración CSS con
comentario explicativo del porqué de `x` (mismo eje que `overflow-x`) y de
`mandatory` (el navegador siempre asienta en el anclaje más cercano; sin
él, `scroll-snap-align: start` del hijo `figure` no tiene efecto porque el
anclaje es una pareja contenedor/hijo, no una propiedad aislada). No hay
duplicación que limpiar ni nombres que mejorar.

## Sabotaje real (doble verificación del test)

1. Se leyó el fichero con `Read` (contenido original guardado).
2. Se quitó con `Edit` la línea `scroll-snap-type: x mandatory;` (y su
   comentario) de `.pista`.
3. Se corrió `pnpm exec vitest run src/components/Galeria.test.tsx` →
   **rojo real**, mismo mensaje de fallo literal que el de partida:
   ```
   AssertionError: expected '{\n  display: flex;\n  gap: espaciado…' to
   match /scroll-snap-type:/
   ❯ src/components/Galeria.test.tsx:408:25
   ```
   (21 tests pasan, 1 falla — exactamente el mismo test, ningún efecto
   colateral sobre el resto de `@s35` ni de `@s1`–`@s17`).
4. Se restauró con `Edit` (no con `git`) la declaración palabra por
   palabra, con el mismo comentario.
5. Se corrió de nuevo `pnpm exec vitest run
   src/components/Galeria.test.tsx src/components/Galeria-logica.test.ts`
   → **30/30 verde** de nuevo.

No se usó ningún comando `git` que modificara el árbol de trabajo, el
índice o el historial (solo `git diff --stat`/`git diff` de solo lectura
para verificar el ámbito al cierre).

## Trazabilidad `@s → test` (solo lo tocado en este ciclo)

| Escenario | Test | Estado |
|---|---|---|
| `@s35` (cláusula "la pista declara anclaje de desplazamiento") | `Galeria.test.tsx:405` `it('la pista declara anclaje de desplazamiento (scroll-snap-type/scroll-snap-align)')` | ✅ verde (era el único rojo del lote) |
| `@s35` (resto de cláusulas: pista horizontal, 2 controles con nombre accesible, ficha imagen+nombre+pie, aviso demo) | `Galeria.test.tsx:394,412,424,441` | ✅ ya verde antes de este ciclo, no tocado |
| `@s1`–`@s17` (fuera de la anatomía del prototipo, mismo fichero) | `Galeria.test.tsx:58-336`, `Galeria-logica.test.ts` completo | ✅ ya verde antes de este ciclo, no tocado |

## Verificación final del lote

- `pnpm exec vitest run src/components/Galeria.test.tsx
  src/components/Galeria-logica.test.ts` → **2 ficheros, 30/30 tests,
  verde**.
- `pnpm exec oxlint --deny-warnings src/components/Galeria.tsx
  src/components/Galeria-logica.ts src/components/Galeria-logica.test.ts
  src/components/Galeria.test.tsx` → **0 avisos, exit 0**.
- `pnpm exec tsc -b` (global): **0 errores atribuibles a este lote**. El
  build global reporta errores preexistentes en ficheros FUERA de ámbito
  (`src/components/Cabecera-logica.ts`, `src/components/Equipo.tsx`,
  `src/components/Hero.test.tsx`), propiedad de otros lotes en curso en
  paralelo ahora mismo — no se tocaron, según la regla de ámbito cerrado.
- `pnpm exec vitest run` (global, informativo): 1192/1203 verdes. Los 11
  rojos restantes están todos en ficheros fuera de ámbito
  (`Cabecera-logica.test.ts`, `CampanasPortada.test.tsx`,
  `InformacionContacto.test.tsx`), de otros lotes paralelos.
- `git diff --stat` acotado a los 5 ficheros del ámbito: solo
  `Galeria.module.scss` (+7/-1, este ciclo) y `Galeria.test.tsx` (heredado
  de la oleada anterior, no reescrito aquí) tienen cambios frente a
  `HEAD`. `Galeria.tsx`, `Galeria-logica.ts` y `Galeria-logica.test.ts`
  están sin diferencias.

## Resultado

`@s35` cerrado: los 5 tests del bloque (incluido el que estaba en rojo)
pasan, con doble anclaje (propiedad CSS real leída en crudo, no solo el
nombre accesible calculado) donde aplica. Ámbito cerrado respetado: único
fichero de producción tocado, `Galeria.module.scss`.
