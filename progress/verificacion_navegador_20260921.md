# Verificación en navegador real — feature 39, 21/09/2026

> `craftsman_lead`. **Esto no es una puerta: es una mirada.** El arnés en verde
> no prueba la maquetación; hay que renderizar y comparar. Hasta hoy, lo único
> que Pablo había visto de este trabajo era una maqueta con CSS inyectado: el
> código real no lo había mirado nadie.
>
> Todo lo de aquí está medido sobre `dist/` **reconstruido en esta sesión**
> (`pnpm run build`, exit 0, puerta de terceros incluida) y servido por
> `vite preview` en el 4173, con el puerto comprobado libre antes de arrancar.
> Nada sale del servidor de desarrollo ni de un `dist/` heredado.

---

## 1. Los cuatro puntos de Pablo, medidos

| # | Lo que pidió | Medido a 1440 | ¿Cumple? |
| --- | --- | --- | --- |
| 1 | Que el botón rojo de «Urgencias» desaparezca por completo | Censo sobre el documento entero: **0** apariciones del texto, **0** rótulos accesibles. En el panel móvil a 390: **0** de 8 enlaces. Los seis `tel:` que quedan son los de la clínica y el de urgencias del FAQ/chat, que Pablo mandó conservar | **Sí** |
| 2 | El nav más a la derecha, a ras del límite del contenido | Borde derecho del `nav` = **1330,00**. Borde derecho del contenido de sección = **1330,00**. **Diferencia 0,00 px** | **Sí** |
| 3 | Espacio entre «Galapavet» y «Centro integral veterinario» | `gap: 4px` declarado sobre el contenedor flex; hueco vertical real entre las dos cajas de texto = **4,00 px**. Un paso de la escala, no un número a mano | **Sí** |
| 4 | Que los botones sean iguales | Los dos del hero: **56 px de alto los dos**, mismo relleno (24/24), mismo radio (999px), mismo cuerpo (16px). Difieren en peso (700 contra 600) y borde, que es la jerarquía intencionada | **Sí, en pantalla** — con una salvedad, abajo |

### 1.1 La salvedad del punto 4, dicha entera

Los dos botones del hero miden 56 px los dos **hoy**, pero esa igualdad **no
está declarada en ninguna parte**: sale de que su contenedor es un `flex` con
`align-items: normal` (= `stretch`), que los estira al mismo alto.

Medido: sacado un botón de su fila, el contenido mide **24 px**; su
`min-height` propio es **56** en el primario (`boton-primario`) y **48** en el
fantasma (`boton-fantasma`, que gana por especificidad a `.acciones a`). O sea
que fuera de esa fila serían **56 y 48: ocho píxeles de diferencia**.

No es un fallo hoy y no lo arreglo dentro de la 39 —la igualdad se ve y se
mide—, pero queda escrito: lo que sostiene el punto 4 de Pablo es un efecto
lateral del `stretch`, no una decisión escrita.

---

## 2. HALLAZGO NUEVO, y no es de esta feature

**Los dos enlaces cortos del nav rompen el ritmo, y se ve antes de medirlo.**

Los ocho enlaces llevan `min-width: 48px`, que es el mínimo de objetivo de
pulsación (WCAG 2.2 SC 2.5.8) y está bien puesto. Pero dos palabras son más
estrechas que los 32 px de contenido que quedan tras el relleno:

| Enlace | Ancho del texto | Ancho de la caja | Sobrante |
| --- | --- | --- | --- |
| `Blog` | 25,53 px | 48,00 px (mínimo) | **6,47 px** |
| `FAQ` | 24,13 px | 48,00 px (mínimo) | **7,88 px** |

Como el enlace es `inline-flex` con `justify-content: normal` (= `flex-start`),
**todo el sobrante cae al lado derecho**. Blanco entre glifos, medido con
`Range.getBoundingClientRect()`:

```
Reservar -> Servicios   20,00
Servicios -> Campañas   20,00
Campañas -> Equipo      20,00
Equipo -> Blog          20,00
Blog -> Contacto        26,47   <-- +32 %
Contacto -> FAQ         20,00
FAQ -> Tienda           35,88   <-- 7,88 del sobrante + 8 del relleno propio
                                    de la píldora "Tienda", que sí es de diseño
```

Seis huecos idénticos y dos saltos. Rompe la **Ley de Semejanza** y la de
**Conectividad Uniforme** sobre una fila que el resto del tiempo es regular.

**No es culpa de la feature 39**: el `min-width` de 48 es anterior y la 39 no
tocó esos dos enlaces. Sale ahora porque es la **primera vez que alguien mira
esta cabecera renderizada**. Registrado como feature **46**
`ritmo_del_nav_y_objetivo_de_pulsacion`, **con puerta humana**: hay dos
arreglos defendibles y ninguno es obviamente mejor, así que no lo decide un
agente. El patrón correcto ya existe en el mismo fichero: `Tienda` lleva
`justify-content: center`.

---

## 3. Dos comentarios más que mienten, en ficheros que nadie miró

Encontrados de paso, leyendo el SCSS para explicar el punto 4. Los dos están en
ficheros que la feature 39 **no modificó**, que es justo por lo que nadie los
revisó:

- `src/components/Hero.module.scss:116` justifica el anillo de foco del hero
  con «mismo recurso que el CTA de urgencias de `Cabecera.module.scss` sobre su
  rojo». **Ese CTA ya no existe**: la justificación remite a un precedente
  borrado.
- `src/data/navegacion.ts:7-9` afirma en presente que «el contrato posterior
  `rediseno_visual.feature` @s28 **sí** añade un CONTROL de urgencias (sin
  texto visible, ver `Cabecera.tsx`)». **Se retiró en la feature 39.** Y está
  en la cabecera del fichero que define la navegación: el primer sitio donde
  mira quien llega nuevo.

Añadidos a la feature **42** `deuda_de_notas_caducadas`, que sube a nueve
avisos.

---

## 4. Lo que se ve, sección por sección

- **Cabecera (1440)** — sin rastro rojo. Marca a la izquierda con su hueco de 4
  px; ocho enlaces a la derecha terminando a ras del contenido; `Tienda` como
  píldora de borde fino. Caja real del enlace `Tienda`: **73,82 × 48**, con la
  píldora visible dibujada dentro a **35 px** por `::before` — el objetivo de
  pulsación no baja de 48 aunque la píldora sea la pequeña del prototipo.
- **Alto de la cabecera** — 64 px renderizados contra `--altura-cabecera: 64px`
  y `scroll-padding-top: 88px` (64 + 24). El solape de 1 px que arrastraba el
  proyecto está cerrado.
- **Contacto** — formulario a la izquierda, mapa a la derecha y sus **tres**
  bloques (Dirección, Teléfonos, Horario). Sin la tarjeta roja. El formulario y
  el mapa siguen enteros.
- **Pie** — tres columnas **4 / 4 / 3** (Clínica, Contenido, Contacto) con la
  misma rejilla y el mismo ritmo. Sin el enlace de urgencias; la columna corta
  no se desalinea.
- **Móvil (390), panel abierto** — ocho enlaces, **ninguno** con «Urgencias».
  El `Tienda` sigue siendo una píldora donde el prototipo pide una fila normal:
  es la feature **41**, ya registrada, no un descubrimiento nuevo.

---

## 5. Cómo reproducirlo

```
pnpm run build
npx vite preview --port 4173 --base /GalapavetClinicaVeterinaria/
```

Y abrir `http://localhost:4173/GalapavetClinicaVeterinaria/`. En Git Bash hay
que anteponer `MSYS_NO_PATHCONV=1`, o se traduce el `--base` a una ruta de
Windows. Las capturas y los scripts de medición son de un solo uso y viven en
el scratchpad de la sesión, fuera del repositorio, a propósito: no son tests y
no deben pasar por puerta ninguna.
