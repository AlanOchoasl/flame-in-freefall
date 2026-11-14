# PSI Combustion Science — catálogo de datos (relevado el 2026-11-14)

Fuente: NASA Physical Sciences Informatics (PSI) — https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation
Relevado navegando la web y consultando los mismos endpoints que usa la página. **Verificar siempre en la fuente** antes de citar cifras.

## Qué es y cómo se accede
- La búsqueda devuelve **26 investigaciones** (24 de Combustion Science, 1 Materials Science, 1 Fluid Physics).
- Página de cada investigación: `https://psi.nasa.gov/physci/repo/data/investigations/PSI-<n>` (ej. PSI-98).
- Observado en el tráfico de la propia web (no es una API documentada; **puede cambiar**):
  - `GET /geode-py/ws/repo/search?term=combustion&source=psi&type=investigation&from=<n>&size=25` — listado JSON (metadatos: título, área, plataforma, objetivos, enfoque, publicaciones).
  - `GET /geode-py/ws/repo/investigations/PSI-<n>` — detalle de una investigación.
  - `POST /geode-py/ws/files/v2` con `{"folder":"PSI-<n>/","fileType":"study","studyId":"PSI-<n>","version":<v>,"obfuscationcode":""}` — lista de archivos por categoría.
  - `GET /geode-py/ws/studies/PSI-<n>/download?file=<nombre>&version=1&redirect=false` — devuelve una URL firmada de S3 (`psi-repo-prod.s3.amazonaws.com`) para bajar el archivo.
- Licencia: PSI-98 declara **CC0-1.0** y un DOI por investigación (botón "Cite this Investigation"). Confirmar la licencia en cada investigación que se use. PSI pide **citar con el DOI**.
- Al usarlo desde un entorno con red restringida hay que permitir `psi.nasa.gov` y `psi-repo-prod.s3.amazonaws.com`.

## Hallazgo clave para el diseño
- Casi todas las investigaciones de microgravedad tienen una **"Experimental table" en CSV** pequeña (KB). Los **datos crudos (imágenes, series) son pesados** (hasta ~5.5 GB por investigación: FLEX, FLEX-2, ACME) — no sirven para una demo en 48 h.
- Las tablas ya están copiadas como muestra en `data/sample/psi/` (~230 KB en total). **Las columnas NO son uniformes entre investigaciones** (nombres, unidades, formatos de fecha distintos): hay que normalizar a mano.
- Las tablas con más filas de datos tabulares comparables: PSI-159 (CFI-G), PSI-10 (Flame Design), PSI-107 (SPICE), PSI-69 (FLEX), PSI-25/26 (BASS), PSI-39 (CFI), PSI-101 (SAME-R).

## Catálogo
| ID | Área | Tipo | Plataforma | Tamaño total aprox. | Tabla CSV (filas) | Título |
|---|---|---|---|---|---|---|
| PSI-117 | Combustion Science | Ground | — | < 0.1 GB | — | Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimension |
| PSI-159 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | CFI-G_Normal Flames.csv (179); CFI-G_Inverse Flames.csv (1015) | Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases |
| PSI-10 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | Flame Design_Normal Flame.csv (207); Flame Design_Inverse Flame.csv (120) | Advanced Combustion via Microgravity Experiments / Flame Design |
| PSI-62 | Combustion Science | Ground | — | < 0.1 GB | — | Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with C |
| PSI-60 | Combustion Science | Ground | — | < 0.1 GB | — | Computational and Experimental Analysis of SPICE Data Sets |
| PSI-181 | Materials Science | Ground | International Space Station (ISS) | 1.28 GB | Experimental Table_PSI_181.csv (?) | Structure and Properties of Pb-Sn and Pb-free Sn-Ag-Cu Solders Produced in Terrestrial vs. |
| PSI-142 | Combustion Science | Ground | Not Applicable | < 0.1 GB | Data Summary Table.csv (8) | Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Cou |
| PSI-108 | Fluid Physics | Microgravity | Space Shuttle | < 0.1 GB | STDCE-1.csv (38); STDCE-1(1).csv (38) | Surface Tension Driven Convection Experiment-1 |
| PSI-101 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | SAME-R.csv (109) | Smoke Aerosol Measurement Experiment-Reflight |
| PSI-115 | Combustion Science | Ground | Not Applicable | < 0.1 GB | — | Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Sim |
| PSI-98 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | SAFFIRE-1.csv (4) | Spacecraft Fire Safety Experiment-I |
| PSI-39 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | CFI.csv (87) | Cool Flames Investigation |
| PSI-102 | Combustion Science | Microgravity | International Space Station (ISS) | 0.43 GB | SAME.csv (8) | Smoke and Aerosol Measurement Experiment |
| PSI-106 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | Slice.csv (12) | Structure and Liftoff In Combustion Experiment |
| PSI-99 | Combustion Science | Microgravity | Cygnus Spacecraft | < 0.1 GB | SAFFIRE-2.csv (15) | Spacecraft Fire Experiment-II |
| PSI-107 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | Spice.csv (469) | Smoke Point In Co-flow Experiment |
| PSI-100 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | SAFFIRE-3.csv (2) | Spacecraft Fire Experiment-III |
| PSI-21 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | CLD Flame.csv (32) | Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame |
| PSI-25 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | BASS-II.csv (129) | Burning and Suppression of Solids - II |
| PSI-20 | Combustion Science | Microgravity | International Space Station (ISS) | 0.44 GB | ACME BRE.csv (18) | Advanced Combustion via Microgravity Experiments - Burning Rate Emulator |
| PSI-68 | Combustion Science | Microgravity | International Space Station (ISS) | 4.38 GB | Flex2.csv (8) | Flame Extinguishment Experiment - 2 |
| PSI-22 | Combustion Science | Microgravity | International Space Station (ISS) | 1.04 GB | ACME E-FIELD Flames.csv (32) | Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusi |
| PSI-23 | Combustion Science | Microgravity | International Space Station (ISS) | 1.37 GB | ACME s-Flame.csv (18) | Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffu |
| PSI-69 | Combustion Science | Microgravity | International Space Station (ISS) | 5.51 GB | FLEX.csv (274) | Flame Extinguishment Experiment |
| PSI-26 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | BASS.csv (122) | Burning and Suppression of Solids |
| PSI-47 | Combustion Science | Microgravity | International Space Station (ISS) | < 0.1 GB | DAFT.csv (2) | Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility T |

Notas: "Tamaño total" suma todos los archivos listados (aprox.). Las filas cuentan registros sin el encabezado. PSI-62, PSI-60, PSI-115 y PSI-117 son estudios de simulación/análisis (sin tabla experimental). PSI-181 (soldaduras) y PSI-47 (polvo) no son fuego propiamente dicho.

## Estructura de columnas relevante (muestra)
- **PSI-159 CFI-G / PSI-10 Flame Design** (ACME, ISS): tipo de llama (normal/inversa), combustible, fracción de O2, presión, caudal de combustible, temperatura adiabática `Tad (K)`, `Zst`, ignición caliente, llama fría (`Cool flame?`/`TFP`). Cientos de ensayos.
- **PSI-107 SPICE** (ISS): combustible, boquilla, caudales de combustible y aire, hora de ignición/apagado (≈470 filas, repetidas).
- **PSI-69 FLEX / PSI-68 FLEX-2** (ISS): gotas — combustible, presión, composición del gas, diámetro inicial, diámetro de extinción, tasa de quemado, duración (≈275 filas en FLEX).
- **PSI-98/99/100 SAFFIRE-I/II/III** (naves Cygnus): material (SIBAL, silicona…), dimensiones, flujo de aire, % O2, potencia de ignición, tiempo de quemado, dirección del flujo; SAFFIRE-II compara largo quemado en µg vs 1 g. Pocas filas (3–16) pero de alto valor narrativo.
- **PSI-25/26 BASS**: películas/esferas de PMMA, SIBAL; O2 y CO2 inicial/final (≈120 filas).
- **PSI-101/102 SAME**: humo/aerosoles por material (Teflon, Kapton…).

## Recursos de contexto (enlaces del desafío)
Ver `Desafío de aplicaciones espaciales de la NASA.md` (Apollo 1, Apollo 13, Mir, spinoffs: tanques de aire, detector de humo, ropa para bomberos).

## Pendiente de verificar
- Licencia y condiciones de uso en cada investigación que usemos.
- Si existen datos tabulares de **1 g (Tierra)** comparables para contrastar con µg (SAFFIRE-II tiene columnas de 1-g; el resto no se verificó).
- Estabilidad de los endpoints observados durante el evento.
