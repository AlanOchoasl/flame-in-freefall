# Flame in Freefall — Color Palette (Light + Dark)

> Proposed tokens, aligned with `design.md`. Base: neutrals + blue; NASA blue/red come from the NASA insignia. Amber is reserved for the challenge-defined Moon-base zone. Contrast ratios are approximate: verify on real displays against WCAG AA before shipping.

## Dark mode

| Token | Value | Usage |
| --- | --- | --- |
| `--canvas` | `#000000` | Page background |
| `--surface-1` | `#111111` | Main panels, investigation rows |
| `--surface-2` | `#171717` | Toolbars, nested areas |
| `--surface-hover` | `#242424` | Hover / neutral emphasis |
| `--line` | `#383838` | Dividers, gridlines |
| `--line-strong` | `#6B6B6B` | Input and control borders |
| `--text-primary` | `#FFFFFF` | Headings, essential values |
| `--text-secondary` | `#CCCCCC` | Body text |
| `--text-muted` | `#AAAAAA` | Metadata (never hide required evidence) |
| `--action` | `#0099FF` | Links, focus, selection, plotted emphasis |
| `--brand` | `#0B3D91` | Filled primary action (white text), brand fills |
| `--zone` | `#FFBB00` | Moon-base zone overlay only |
| `--accent-red` | `#FC3D21` | Brand accent and error states only |

## Light mode

| Token | Value | Usage |
| --- | --- | --- |
| `--canvas` | `#F6F7F9` | Page background |
| `--surface-1` | `#FFFFFF` | Main panels, investigation rows |
| `--surface-2` | `#EEF0F4` | Toolbars, nested areas |
| `--surface-hover` | `#E3E6EC` | Hover / neutral emphasis |
| `--line` | `#D0D5DD` | Dividers, gridlines |
| `--line-strong` | `#6B7385` | Input and control borders |
| `--text-primary` | `#0A0F1A` | Headings, essential values |
| `--text-secondary` | `#3C4556` | Body text |
| `--text-muted` | `#5B6475` | Metadata |
| `--action` | `#0B3D91` | Links, focus, selection, primary action (white text) |
| `--brand` | `#0B3D91` | Brand fills |
| `--zone` | `#A15C00` | Moon-base zone stroke/label (fill: same hue at 12% opacity) |
| `--accent-red` | `#C8321B` | Brand accent and error states only |

## CSS

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

:root[data-theme="light"] {
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

/* Follow the OS when the user has not chosen a theme */
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

## Rules

- **Why the action color changes:** NASA blue `#0B3D91` is only ~2:1 on black, so dark mode uses `#0099FF` for text and links and keeps `#0B3D91` as a fill with white text. `#0099FF` is only ~3:1 on white, so light mode uses `#0B3D91`.
- **Red:** never use it for scientific results or as a safety verdict. `#FC3D21` fails as small text on white, hence the darker `#C8321B` in light mode.
- **Zone:** amber marks a condition defined in the challenge statement, not a hazard. Always pair it with a dashed boundary and a legend.
- **Charts:** never rely on hue alone; add line style, labels and a legend.

## Logo visibility (both modes)

- Use the official full-color insignia, unmodified.
- Wrap it in a circular container with a 1px ring using `--logo-ring` (or a white circular backing in both modes) so the dark blue disc does not disappear on black.
- Check NASA's insignia usage guidelines and the Space Apps Challenge rules before placing it in the UI; `design.md` also asks not to imply NASA endorsement. A text citation ("Data: NASA PSI") is the safe default.
