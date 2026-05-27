# Templates (Build-Time Binding)

Goal: keep **all markup in HTML templates** and do **data binding at build time** (Node + Cheerio), producing a fully static `dist/index.html`.

Runtime JS is interaction-only (nav sticky, sidenav, carousel controls, theme toggle, tap-target, etc.).

## Conventions

### 1) "Prototype" elements for repeating lists
For any list/grid that repeats (skills cards, experience cards, interests cards, references slides), the template must include **exactly one** prototype element marked with `data-tpl`.

Example:
- Container: `#skills-cards`
- Prototype: `[data-tpl="skills-card"]`

Build rules:
- Build clones the prototype once per JSON item.
- Build removes the original prototype from output after cloning.

### 2) Stable hooks over CSS classes
Binders should prefer stable ids and `data-*` hooks (e.g. `#skills-cards`, `[data-tpl="skills-card"]`, `[data-role="skills-title"]`) rather than styling classes.

### 3) Data is the source of truth
JSON under `data/` is the single source of truth for content. Templates are structure-only.

## Mapping (current + planned)

- `data/site.json` -> `templates/features/navigation.template.html` (nav items), plus head/metadata injected by build
- `data/about.json` -> `templates/features/about.template.html`
- `data/skills.json` -> `templates/features/skills.template.html`
- `data/experience.json` -> `templates/features/experience.template.html`
- `data/references.json` -> `templates/features/references.template.html`
- `data/interests.json` -> `templates/features/interests.template.html`

## Status

- Template injection is wired in `scripts/build.js`.
- HTML string renderers still exist in `scripts/sections/*.js` and will be migrated to build-time binders incrementally.

