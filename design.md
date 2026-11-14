# DESIGN.md — Flame in Freefall (NASA Space Apps Challenge 2026)

> Documento normativo de arquitectura de interfaz, diseño visual, tokens semánticos y reglas de renderizado para el desarrollo del proyecto **Flame in Freefall** (explorador científico para repositorios NASA PSI Combustion Science).

---

## 1. Misión del Producto y Restricciones Centrales

**Flame in Freefall** es una consola analítica y explorador de investigación histórica diseñado para profesores, estudiantes e ingenieros aeroespaciales. Su objetivo es clasificar, comparar e inspeccionar investigaciones archivadas en microgravedad (NASA Physical Science Informatics - PSI).

### Reglas Inviolables de Presentación (Fidelidad Científica):
1. **Identidad del sistema:** Es un explorador analítico de datos de archivo, **NO** un monitor de telemetría de nave en tiempo real ni un predictor de riesgo de incendio operativo. Debe incluir siempre el aviso:
   > *"Experimental data explorer — not a spacecraft monitor or operational fire-risk predictor."*
2. **Cero alucinación de datos o vacíos:** Un espacio vacío o no muestreado en el gráfico de dispersión representa **ausencia de cobertura registrada**, jamás prueba de seguridad o ininflamabilidad.
3. **Puntuación del algoritmo:** La métrica de afinidad debe etiquetarse siempre como:
   > *"Team relevance heuristic — not a NASA safety rating."*
4. **Tratamiento de datos faltantes:** Mostrar explícitamente `"Not available"` en tablas o fichas, nunca guiones vacíos (`-`), ceros arbitrarios ni omitir la fila.
5. **Acreditación obligatoria:** Citar en cada pantalla la fuente oficial:
   > `Data: NASA Physical Science Informatics (PSI) Combustion Science Repository · Independent research exploration`

---

## 2. Paleta de Colores y Tokens Semánticos (`palette.md`)

El diseño admite **Modo Oscuro (Dark Mode - predeterminado)** y **Modo Claro (Light Mode)**. Los colores tienen roles semánticos fijos y nunca se usan de forma decorativa arbitraria.

### 2.1 Tabla de Tokens

| Token Semántico | Modo Oscuro (Dark) | Modo Claro (Light) | Propósito y Reglas de Uso |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#000000` / `#0D1114` | `#F6F7F9` | Fondo general de la aplicación |
| `--surface-1` | `#111111` / `#151C20` | `#FFFFFF` | Paneles principales, filas de ranking, tarjetas base |
| `--surface-2` | `#171717` / `#1A2328` | `#EEF0F4` | Barras de herramientas secundarias, contenedores anidados |
| `--surface-hover` | `#242424` | `#E3E6EC` | Estados hover y énfasis neutro interactivo |
| `--line` | `#383838` / `#2B383E` | `#D0D5DD` | Divisores de 1px, retícula técnica de gráficos |
| `--line-strong` | `#6B6B6B` | `#6B7385` | Bordes de inputs, controles activos, ejes coordenados |
| `--text-primary` | `#FFFFFF` / `#E8EEEB` | `#0A0F1A` | Encabezados, títulos de investigación, valores numéricos clave |
| `--text-secondary` | `#CCCCCC` | `#3C4556` | Textos explicativos, razonamiento algorítmico, resúmenes |
| `--text-muted` | `#AAAAAA` / `#95A4A5` | `#5B6475` | Metadatos, etiquetas técnicas de ejes, códigos DOI |
| `--action` | `#0099FF` | `#0B3D91` | Enlaces, puntos seleccionados, estados activos de tableros |
| `--brand` | `#0B3D91` (texto blanco) | `#0B3D91` | Botones de acción primaria, badges institucionales |
| `--zone` | `#FFBB00` | `#A15C00` | **Exclusivo para la región lunar esperada** ($O_2 \ge 30\%$, $P \le 0.70\text{ bar}$). |
| `--accent-red` | `#FC3D21` | `#C8321B` | Extinción crítica / anomalías / avisos de brecha de datos |
| `--logo-ring` | `#383838` | `#C9CED8` | Anillo contenedor de 1px para el imagotipo de cabecera |

### 2.2 Variables CSS

```css
:root {
  color-scheme: dark;
  --canvas: #000000;
  --surface-1: #111111;
  --surface-2: #171717;
  --surface-hover: #242424;
  --line: #383838;
  --line-strong: #6b6b6b;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #aaaaaa;
  --action: #0099ff;
  --brand: #0b3d91;
  --zone: #ffbb00;
  --accent-red: #fc3d21;
  --logo-ring: #383838;
}

:root[data-theme="light"],
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    color-scheme: light;
    --canvas: #f6f7f9;
    --surface-1: #ffffff;
    --surface-2: #eef0f4;
    --surface-hover: #e3e6ec;
    --line: #d0d5dd;
    --line-strong: #6b7385;
    --text-primary: #0a0f1a;
    --text-secondary: #3c4556;
    --text-muted: #5b6475;
    --action: #0b3d91;
    --brand: #0b3d91;
    --zone: #a15c00;
    --accent-red: #c8321b;
    --logo-ring: #c9ced8;
  }
}
```

---

## 3. Tipografía y Estilo de Componentes

### 3.1 Familias Tipográficas
- **Interfaz y Lectura (UI & Body):** `Hanken Grotesk`, `Inter` o fuentes del sistema sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Datos Numéricos, Rangos y Códigos:** Monospace de alta legibilidad (`JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`).

### 3.2 Escala y Geometría
- **Corner Radius:** 4px a 6px (estilo técnico plano, sin redondeces exageradas estilo app móvil de consumo).
- **Bordes:** 1px sólido en divisores, sin sombras difusas (`box-shadow: none` o sombras de contacto de 1px).
- **Densidad:** Alta densidad informativa según `AGENTS.md`. Padding interno de tarjetas de 12px a 16px; espaciados entre elementos de 8px a 12px.
- **Micro-retícula (Coverage Map):** Fondo tipo *dot-matrix* sutil (`radial-gradient(#383838 1px, transparent 1px)` espaciado cada 20px) con marcas axiales y cruzadas en cuadrantes.

---

## 4. Estructura de Navegación y Vistas Especificadas

La plataforma consta de **únicamente cinco (5) pantallas funcionales**. No se deben añadir páginas de marketing, galerías decorativas ni dashboards desconectados.

### 4.1 Shell Global Permanente (Header & Footer)
- **Top Bar:**
  - Logomarca de texto: `FLAME IN FREEFALL` + badge `PSI-EXPLORER`.
  - Estado honesto del sistema: indicador con punto `Cached Research Data`.
  - Enlaces de navegación activos: `RANKING`, `COVERAGE MAP`, `COMPARE`, `INVESTIGATION DETAIL`, `ABOUT / METHOD`.
  - Conmutador de tema `DARK / LIGHT` y referencia de compilación `SYS.REV 4.2 / PSI-DS-2024.11`.
- **Aviso Metodológico Sub-header:**
  - Banda persistente de 1px: `⚠ Experimental data explorer — not a spacecraft monitor or operational fire-risk predictor.`
- **Footer Técnico:**
  - Cita a NASA PSI, aclaración de heurísticas independientes y nodos de nodo/consola (`Node: ARC-PSI-09 · Console: µG-COMB-V3.2`).

---

### 4.2 Pantalla 1: Ranking — Investigation Explorer (Vista Principal)
- **Selector de Perfil de Misión:** Filtros rápidos tipo píldora (`Crew Cabin`, `Lunar Base`, `Detection`, `Suppression`).
- **Métricas de Dataset (4 baldosas compactas):**
  1. `Indexed Entities`: 24 Investigaciones.
  2. `Historical Data`: 412 Puntos de ensayo registrados.
  3. `Ambient Regimes`: 0.40 – 1.00 bar.
  4. `Coverage Density`: 86% Parameter Grid.
- **Filas de Investigaciones:**
  - Encabezado con código Accession en mono (`PSI-CB-0042`, `PSI-CB-0019`, `PSI-CB-0058`).
  - Nombre completo de la investigación (ej: *BASS-II: Burning and Suppression of Solids - II*).
  - Parámetros clave en tags monocromáticos: combustible, diluyente, régimen de flujo.
  - Justificación algorítmica en texto claro (`Algorithmic Correlation Reasoning`).
  - Puntuación heurística destacada (`94/100`), etiquetada: `"Team relevance heuristic — not a NASA safety rating"`.
  - Botones de acción: `Inspect Detail`, `Add Compare`, `PSI Source (externo)`.
- **Barra Lateral Derecha:**
  - Sliders de ponderación del vector heurístico ($O_2$ Fraction 45%, Pressure 35%, Convective Flow 20%).
  - Módulo `Data Gap Notice` con aviso de incertidumbre en regímenes $< 0.48\text{ bar}$.
  - Miniatura o acceso directo al `Coverage Map`.

---

### 4.3 Pantalla 2: Coverage Map — $O_2 \times \text{Pressure Tests}$
- **Espacio Gráfico Central (75% ancho):**
  - Eje horizontal X: Presión ambiente en bar ($0.1\text{ bar}$ a $1.5\text{ bar}$ / $1.01\text{ bar}$ = 1 ATM nivel del mar).
  - Eje vertical Y: Concentración volumétrica de oxígeno ($15\%$ a $45\%$ / $21.0\%$ nivel del mar terrestre).
  - Puntos de ensayo discretos con halo concéntrico según fase de combustible (Sólido, Gotas líquidas, Gas de difusión).
  - **Recuadro de Envoltura de Hábitat Lunar:**
    - Delimitación poligonal con línea discontinua en `--zone` (`#FFBB00` / `#A15C00`).
    - Coordenadas: $O_2 \ge 30\%$, $P \le 0.70\text{ bar}$ ($10.2\text{ psi}$).
    - Rotulado obligatorio: *"Expected Lunar-Condition Region (Challenge Specification · Not a certified safe threshold)"*.
  - Callout de inspección flotante sobre el punto enfocado (ej. `EXP-702-B` BASS-II, $0.65\text{ bar}$, $32.5\% O_2$, Quenched).
- **Barra Lateral de Filtros e Inspector:**
  - Tarjeta de telemetría del punto seleccionado (Accession, Fuel, Velocity, Quench Status).
  - Checkboxes de fase de combustible (Sólido, Líquido, Gas) y tipo de diluyente ($N_2, CO_2, He$).
  - Botón directo para alternar a **"View Data as Table"** (accesibilidad y fallback).

---

### 4.4 Pantalla 3: Compare Investigations (Matriz Tri-Fase)
- **Columnas Comparativas Alineadas:**
  - Comparativa de 3 columnas simultáneas (BASS-II Sólido vs. FLEX-2 Líquido vs. ACME/CIR Gas).
- **Filas Normalizadas:**
  1. `Scientific Objective`
  2. `Target Fuel & Geometry`
  3. `Oxygen Regimes Tested`
  4. `Pressure Range (bar / psi)`
  5. `Flow Conditions (convección forzada vs. quiescente)`
  6. `Hardware / Facility (MSG vs. CIR)`
  7. `Key Diagnostic Measurements`
  8. `Team Relevance Score`
  9. `Data Gaps & Limitations`
- **Regla Estricta:** Las mediciones que no existan en el repositorio se representan con la etiqueta fija `Not available`.

---

### 4.5 Pantalla 4: Investigation Detail (Ficha de Estudio)
- **Cabecera de Archivo:**
  - Código accession `PSI-CB-0042`, hardware de vuelo (*ISS CIR / MDCA*), Investigador Principal (*Dr. Sandra Olson, NASA GRC*).
  - Identificador verificado DOI (`10.2514/6.2016-1234`) y link de apertura en NASA PSI.
- **Secciones de Contenido:**
  - *Research Facts & Apparatus*: dimensiones de probeta, mezcla oxidante y sensores ópticos.
  - *Recorded Test Ranges*: barras horizontales con los rangos probados frente al límite lunar de referencia.
  - *AI-Generated Investigation Synthesis*: Bloque con borde destacado y etiqueta explícita:
    > *"AI-Generated Investigation Synthesis · Synthesized from published PSI experiment logs. Not official NASA findings."*
  - *Lunar Baseline Alignment*: Gráfico 2D de intersección de la envolvente de la prueba frente a Artemis.
  - *Methodological Limitations & Source Abstract*: Texto de publicación original y notas de límites de ventilación de la cámara.

---

### 4.6 Pantalla 5: About & Methodology (Gobernanza y Auditoría)
- **Aviso de Consola No Certificada:**
  - Explicación de que es un desarrollo independiente para NASA Space Apps Challenge 2026.
- **Procedencia de Datos:**
  - Documentación de los canales de ingesta: Caída terrestre (Drop Towers), Parabólicos (KC-135/DC-9) y orbitales (ISS CIR).
- **Fórmula de la Heurística de Clasificación:**
  - Fórmula matemática visible:
    $$R_{\text{Score}} = 100 \times (0.45 \cdot \Phi_{\text{atm}} + 0.35 \cdot \Phi_{\text{fuel}} + 0.20 \cdot \Phi_{\text{flow}})$$
- **Definición de Hábitat Lunar:**
  - Desglose del valor estándar del reto: $O_2 \ge 30\%$, $P \le 10.2\text{ psi}$ ($0.70\text{ bar}$).
- **Reglas de Interpretación:**
  - Regla 1: *Absence of Data $\neq$ Absence of Risk*.
  - Regla 2: *Zero Gravitational Extrapolation Limit*.
  - Regla 3: *Quiescent vs. Forced Flow Disparity*.
- **Divulgación de Inteligencia Artificial:**
  - Detalle del rol de LLMs exclusivamente en síntesis de abstracts y normalización de unidades, con auditoría humana final.

---

## 5. Directrices de Implementación Técnica (Código Frontend)

1. **Estructura HTML Semántica:**
   - Usar `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>` y `<footer>`.
   - Tablas accesibles con `<caption>`, `<thead>`, `<tbody>`, `<th>` para el fallback de datos tabulares.
2. **Interactividad CSS y JS:**
   - Transiciones rápidas y secas (`120ms` a `150ms ease-out`), sin animaciones que simulen radar o parpadeos de falsa telemetría.
   - El interruptor de tema debe aplicar `data-theme="light"` o `data-theme="dark"` en la raíz `<html>`.
3. **Control de Layouts Responsivos (Mobile/Desktop):**
   - **Desktop:** Retícula técnica multipanel, scatterplot central al 70-75% del ancho, barras laterales de herramientas fijas.
   - **Mobile:** Disposición apilada a 1 columna; selector de métricas en 2 columnas; gráfico de dispersión con contenedor de desplazamiento horizontal y acceso primario al botón *"Ver como tabla"*.
4. **Licenciamiento y Dependencias:**
   - Cumplimiento estricto con `AGENTS.md`: No cargar fuentes o librerías de terceros con licencias restrictivas; priorizar dependencias estándar con licencias permisivas (MIT, Apache-2.0, BSD).
