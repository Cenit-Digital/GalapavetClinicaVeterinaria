Feature: Configuración ejecutable de la puerta de mutación
  Como responsable del cierre quiero que la configuración de Stryker sea ejecutable y esté protegida para que el arnés no vuelva a emitir una línea de órdenes inválida.

  @s1
  Scenario: La configuración del proyecto delega la superficie mutable a Stryker sin argumentos vacíos
    Given el archivo de configuración del arnés de este proyecto y su lista de objetivos de mutación vacía
    When se lee el comando configurado para la mutación
    Then el comando es exactamente "pnpm exec stryker run"
    And no contiene "--mutate"
    And no contiene "{{target}}"

  @s2
  Scenario: La configuración de Stryker conserva la única superficie mutable y el umbral de cierre
    Given el archivo de configuración de Stryker del proyecto
    When se inspeccionan sus patrones de mutación, exclusiones y umbrales
    Then declara los patrones inclusivos "src/lib/**/*.ts" y "src/**/*-logica.ts"
    And excluye únicamente "!src/**/*.test.ts" y "!src/**/*.test.tsx"
    And su umbral de ruptura es exactamente 100

  @s3
  Scenario: La regresión de configuración forma parte del CI del arnés
    Given la configuración de Stryker aprobada y la regresión literal del proyecto
    When se ejecuta "pnpm run test:config"
    Then el código de salida es 0
    And el workflow "Harness CI" ejecuta esa misma regresión después de "bin/harness init"

  @s4
  Scenario: Las regresiones del motor y del navegador permanecen verdes sin ampliar la superficie mutable
    Given la configuración de Stryker aprobada y la red de regresión existente del motor y del navegador
    When se ejecutan la red de regresión del motor y la puerta completa "pnpm run test:e2e"
    Then ambos comandos terminan con código de salida 0
    And la configuración de Stryker conserva exactamente los patrones y exclusiones declarados en @s2
    And no se modifica código de producción ni pruebas de producto para corregir esta puerta

  @s5
  Scenario: Stryker carga explícitamente el runner de Vitest
    Given el archivo de configuración de Stryker y el paquete del runner de Vitest instalados en el proyecto
    When se inspecciona la lista de plugins de Stryker
    Then declara exactamente el plugin "@stryker-mutator/vitest-runner"
    And conserva "vitest" como runner de pruebas

  @s6
  Scenario: La configuración elimina las dos fuentes conocidas de avisos
    Given el archivo de configuración de Stryker del proyecto
    When se inspeccionan sus propiedades y patrones de mutación
    Then no declara la propiedad "_comment_concurrency"
    And no declara el patrón "!src/**/*.d.ts"

  @s7
  Scenario: La enmienda preserva literalmente la superficie efectiva y los límites de ejecución
    Given el archivo de configuración de Stryker después de aplicar la enmienda
    When se inspeccionan los patrones de mutación, umbrales y límites de ejecución efectivos
    Then los únicos patrones inclusivos son "src/lib/**/*.ts" y "src/**/*-logica.ts"
    And las únicas exclusiones son "!src/**/*.test.ts" y "!src/**/*.test.tsx"
    And los umbrales "high", "low" y "break" son exactamente 100
    And la concurrencia es exactamente 1 y el timeout es exactamente 60000 milisegundos

  @s8
  Scenario: Una ejecución seca alcanza el runner sin avisos ni errores
    Given la configuración de Stryker enmendada y las dependencias del proyecto instaladas
    When se ejecuta "pnpm exec stryker run --dryRunOnly"
    Then el código de salida es 0
    And la salida confirma la ejecución del runner "vitest"
    And la salida no contiene avisos de configuración ni de patrones sin coincidencias
    And la salida no contiene un error de carga del runner de pruebas

  @s9
  Scenario: La deuda histórica de mutación global queda fuera del alcance de esta corrección
    Given la medición global de producto registrada el 26/08/2026
    When se revisa el alcance de esta feature redefinida con autorización humana
    Then no se cambia código de producción ni pruebas de producto para elevar aquella puntuación
    And la medición global previa no se usa para declarar esta corrección de configuración
