# Enmiendas — tarea de reparación `regresiones_27_28_29` (03/09/2026, oleada B)

> Contratos vigentes que esta reparación toca. Cada entrada lleva el antes y el
> después literal, como exige `project-spec.md` («Contratos vigentes»). Lo que
> NO es enmienda (solo endurece una aserción o amplía una lista de prohibidos)
> se anota al final para que el `judge` no tenga que buscarlo.

## Enmienda 1 — `identidad_visual.feature` @s31 (tests/e2e/imagenes.spec.ts): imágenes de cubierta

**Cláusula del contrato (sin cambiar):**

> And la relación entre el ancho y el alto medidos de cada hueco coincide con
> la relación de aspecto que su propia maquetación declara, con una tolerancia
> máxima de 1 píxel CSS

**Por qué:** el test implementaba «la relación de aspecto que su propia
maquetación declara» como el cociente de los atributos `width`/`height` del
`<img>`. Para una imagen en flujo eso es correcto (es lo que reserva el hueco
y evita el CLS, @s30). Para la fotografía de fondo del hero
(`Hero.module.scss`, `.hero > img`: `position: absolute; inset: 0; width: 100%;
height: 100%`) NO lo es: su maquetación declara que cubre la sección entera,
cuya altura la fija el contenido (`min-height` fluido, `fidelidad_hero` @s2,
que además eliminó el `aspect-ratio` que recortaba contenido). Es una imagen
fuera de flujo: no tiene hueco propio que reservar ni puede colapsar. Hasta
hoy este caso quedaba tapado porque el bucle se detenía antes, en el logotipo
de la cabecera (sin fondo de reserva), primero en orden del documento.

**Antes (literal, `tests/e2e/imagenes.spec.ts`):**

```ts
      return Array.from(document.images).map((imagen) => {
        const caja = imagen.getBoundingClientRect()
        const estilo = getComputedStyle(imagen)
        const anchoDeclarado = Number(imagen.getAttribute('width'))
        const altoDeclarado = Number(imagen.getAttribute('height'))
        return {
          alto: caja.height,
          relacionMedida: caja.width / caja.height,
          relacionDeclarada: anchoDeclarado / altoDeclarado,
          fondo: aHex(estilo.backgroundColor),
          fondoEsperadoHex: hexEsperado.startsWith('#') ? hexEsperado.toUpperCase() : aHex(hexEsperado),
        }
      })
```

**Después (literal):**

```ts
      const esDeCubierta = (estilo: CSSStyleDeclaration): boolean =>
        estilo.position === 'absolute' &&
        estilo.top === '0px' &&
        estilo.right === '0px' &&
        estilo.bottom === '0px' &&
        estilo.left === '0px'
      return Array.from(document.images).map((imagen) => {
        const caja = imagen.getBoundingClientRect()
        const estilo = getComputedStyle(imagen)
        const anchoDeclarado = Number(imagen.getAttribute('width'))
        const altoDeclarado = Number(imagen.getAttribute('height'))
        const contenedorCubierto = esDeCubierta(estilo) ? imagen.offsetParent?.getBoundingClientRect() : undefined
        return {
          alto: caja.height,
          relacionMedida: caja.width / caja.height,
          relacionDeclarada:
            contenedorCubierto === undefined
              ? anchoDeclarado / altoDeclarado
              : contenedorCubierto.width / contenedorCubierto.height,
          fondo: aHex(estilo.backgroundColor),
          fondoEsperadoHex: hexEsperado.startsWith('#') ? hexEsperado.toUpperCase() : aHex(hexEsperado),
        }
      })
```

**Qué sigue mordiendo:** para toda imagen se exige alto > 0 y fondo de reserva
`--color-fondo-alterno`; para las 17 imágenes en flujo, la relación de sus
atributos; para la única de cubierta (`/img/hero/clinica.webp`, la única
`<img>` con `position: absolute` en la portada, medido con `/img/**`
bloqueado), que su rectángulo coincida con el de la sección que cubre — si
dejara de cubrirla (p. ej. `height: auto`), el test caería en rojo.

## No son enmiendas (endurecimientos y ampliaciones)

- `tests/e2e/fidelidad-servicios.spec.ts` @s1: `toContainText('Servicios
  veterinarios')` / `toContainText('Galapagar')` pasan a `toHaveText('Servicios
  veterinarios en Galapagar')` / `toHaveText('en Galapagar')`. Más estricto;
  el contrato `fidelidad_servicios` @s1 («titular de dos partes cuya segunda
  parte usa la localidad real») no cambia. Con la aserción laxa sobrevivió el
  copy del prototipo «de principio a fin».
- `tests/e2e/datos-reales.spec.ts` (@s52 de `rediseno_visual`): la lista de
  afirmaciones prohibidas incorpora `{ categoria: 'cobertura integral de
  servicios', frase: 'de principio a fin' }`. La puerta pura
  (`ejecutarPuertaDeAfirmacionesProhibidas`) admite cualquier frase; no se
  toca `src/lib/diseno/datosDelSitio.ts`.
- `src/lib/diseno/matrizDeContraste.ts`: fila nueva `{ rol: 'sobre-primario',
  fondo: 'tinta', uso: 'componente de interfaz o borde de foco' }` (anillo de
  foco de las acciones del hero); el recuento del test sube de 24 a 25.
