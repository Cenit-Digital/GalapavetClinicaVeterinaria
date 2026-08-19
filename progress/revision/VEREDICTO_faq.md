# Veredicto — features/faq.feature (grupo G3)

Verificador independiente. Alegaciones recogidas de L1_G3.md (4), L2_G3.md (0),
L3_G3.md (1). Total alegaciones antes de fusión: 5. Tras colapsar duplicados: 4
veredictos.

| Ancla | Severidad | Veredicto | Lentes | Motivo (cita propia) |
| --- | --- | --- | --- | --- |
| @s10 (L155/L160, "cinco respuestas simultáneas") | grave | **REFUTADO** | L1 | El When (`faq.feature:155 "se revisa el texto de las cinco respuestas"`) va precedido de un Given a nivel de catálogo (`faq.feature:154 "el catálogo de preguntas frecuentes tal y como se publica"`), no de interacción con el DOM como en el resto del fichero (p. ej. `faq.feature:81 "el visitante pulsa el control..."`). Esa redacción es simétrica a la de @s13 (`faq.feature:179 "la fuente única de datos de negocio declara..."`), que sí es explícitamente un chequeo de datos. Hay una lectura razonable —leer las 5 respuestas del catálogo/fixture, o abrirlas y cerrarlas en secuencia— que no exige tenerlas expuestas a la vez en el árbol accesible, así que no colisiona con la exclusividad de @s1/@s7. |
| @s10 (L160, choque con @s6 por "vacuna") | grave | **REFUTADO** | L1 | El bloque "Medicina general" que sí está publicado incluye explícitamente vacunación: `docs/datos-galapavet.md:64 "**Medicina general** — Preventiva · Vacunaciones · Desparasitaciones · Chequeo · Identificación con microchip."`. Que la respuesta divulgativa de @s6 mencione "vacunar" no es "mencionar un servicio fuera de los cinco bloques publicados" (`faq.feature:160`): la vacunación está dentro de uno de esos cinco bloques, no fuera. No hay colisión real. |
| @s12 (L172-175, fixture sin nombrar / Then ciego a mutación / caso "pregunta vacía" sin cubrir) | grave | **CONFIRMADO** | L1,L3 | `faq.feature:172 "Given el catálogo de preguntas frecuentes tiene 3 entradas y una de ellas tiene la respuesta vacía"` no nombra ninguna de las 3 entradas, y `faq.feature:175 "And ninguno de esos controles tiene el nombre accesible de la entrada con respuesta vacía"` da por hecho un nombre que el propio escenario nunca declaró: el implementador tiene que inventar el fixture. Además el Then (líneas 174-175) solo fija un recuento (2) y una negación (no lleva el nombre de la excluida), sin anclar el nombre accesible positivo de ninguna de las 2 supervivientes, así que un mutante que deje 2 controles con nombres erróneos-pero-no-vacíos pasaría sin ser detectado. Y el título del escenario (`faq.feature:171 "Una entrada con pregunta o respuesta vacía se omite del acordeón"`) promete cubrir tanto "pregunta" como "respuesta" vacía, pero el Given solo monta el caso de respuesta vacía — el caso de pregunta vacía queda sin ejercitar. |
| @s2 (L86, "domingos cerrado" vs fuente) | grave | **REFUTADO** | L1 | El propio fichero ya minusculiza sistemáticamente los días de la semana en mitad de frase — `faq.feature:85 "sábados de 11:00 a 14:00"` frente a `docs/datos-galapavet.md:36 "**Sábados** de **11:00 a 14:00**"` — porque en español los días de la semana no se capitalizan salvo al inicio de frase; la mayúscula de la fuente es solo el inicio del bullet, no una convención de nombre propio. Es la misma normalización aplicada a "domingos", no una pérdida de fidelidad aislada. Y como la comparación es de tipo "contiene" (subcadena), `"domingos cerrado"` es subcadena tanto de `"domingos cerrado"` como de `"domingos cerrados"`, así que la diferencia de número entre el texto del contrato y `docs/datos-galapavet.md:37 "- **Domingos cerrados**"` no puede hacer fallar el test en ningún caso: cualquiera de las dos formas que renderice la UI lo satisface. |

## Resumen

- Total alegaciones sobre features/faq.feature (antes de fusión): 5
- Duplicados colapsados: 1 (L1 y L3 sobre @s12 fusionados en un único veredicto)
- Veredictos emitidos: 4
- Confirmados: 1
- Refutados: 3
