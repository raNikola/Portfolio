# Icon Migration Log

Working notes for replacing the current site icons with local Lucide SVG icons.

## Goal

- Replace existing icon font usage with Lucide SVG icons.
- Keep icons local on the server, with no CDN dependency.
- Preserve the current visual design and Materialize layout.
- Avoid large unused icon payloads in production.

## Preferred Approach

- Keep Lucide source SVG files locally in the project.
- Generate or maintain a production sprite containing only icons actually used by the site.
- Use SVG `<use>` references in HTML where practical:

```html
<svg class="site-icon" aria-hidden="true">
    <use href="assets/icons/lucide.svg#camera"></use>
</svg>
```

## Current Recommendation

- Do not inline every SVG manually across the full site.
- Do not ship one huge sprite with the entire Lucide library.
- Use a local generated sprite for the active icon set.

## Planned Steps

1. Audit all current icon usages in `index.html` and CSS.
2. Map each existing icon to a Lucide equivalent.
3. Add a local icon asset location, likely:

```text
assets/icons/lucide/
assets/icons/lucide.svg
```

4. Create or copy only the Lucide icons needed by the current site.
5. Replace icon font markup with SVG markup.
6. Remove temporary CSS-mask icons from the `Interests` cards.
7. Keep `iconmonstr` CSS/fonts until every old icon usage has been replaced.
8. Remove old icon font assets only after verification.

## Risks / Notes

- External SVG sprite references may not work from `file://` in every browser. They are expected to work when served over HTTP/HTTPS.
- Some social brand icons may not exist in Lucide because Lucide is not a brand icon set. Those may need to remain as existing SVG assets or be handled separately.
- Icons inside buttons and interactive controls need accessible labels if they are not decorative.

## Change History

### 2026-05-08

- Created this log before starting the full icon migration.
- Decision: use local Lucide SVG assets, preferably a production sprite with only used icons.
- Decision: preserve existing site design and migrate icons incrementally.
- Added `assets/icons/site-icons.svg` as a local SVG sprite.
- Migrated `index.html` from `iconmonstr` `<i class="im ...">` markup to local SVG `<use>` markup.
- Removed the `iconmonstr` stylesheet link from `index.html`.
- Included Lucide-style outline icons for menu, chevrons, mail, camera, mountain, bike, globe, terminal, smart home, and download.
- Included local brand symbols for GitHub, LinkedIn, and Instagram using existing local SVG paths, because Lucide does not provide brand icons.
- Replaced the old icon-font quote pseudo icon in `assets/css/main_style.css` and `assets/css/main_style.scss` with a normal typographic quote.
- Added shared `.site-icon` styling in `assets/css/fix.css`.
- Removed old commented CSS-mask icon code from `assets/css/fix.css`.
- Set brand symbols in `assets/icons/site-icons.svg` to `stroke="none"` so global outline icon styling does not thicken filled brand icons.
- Added `save` symbol to `assets/icons/site-icons.svg` and changed the resume action icon from `#download` to `#save`.
- Clarification from user: the real full site is `org_index.html`, and the user wants the full Lucide icon set available locally so icons can be changed manually across the full site.
- Installed `lucide-static` locally via npm.
- Copied all Lucide SVG files into `assets/icons/lucide/`.
- Added `assets/icons/lucide/README.md` with usage notes.
- Current approach:
  - `assets/icons/lucide/*.svg` is the full local icon library for manual selection.
  - `assets/icons/site-icons.svg` remains a small migrated sprite used by the current `index.html` working page.
- Changed `index.html` again to stop depending on `assets/icons/site-icons.svg`.
- `index.html` now uses direct local icon file paths through CSS masks:

```html
<span class="site-icon"
      style="--site-icon: url('assets/icons/lucide/save.svg')"
      aria-hidden="true"></span>
```

- Social brand icons in `index.html` use existing local brand SVG files from `assets/images/`.
- Verification after direct-file migration:
  - No remaining `<use href="assets/icons/site-icons.svg#...">` usage in `index.html`.
  - No remaining `<svg class="site-icon">` usage in `index.html`.
  - `index.html` has 20 icon placements using `--site-icon`.
  - All 15 unique icon file paths referenced by `--site-icon` exist locally.
- Fixed `.site-icon` CSS to avoid the `mask` shorthand and use explicit `mask-image`, `mask-size`, `mask-repeat`, and `mask-position` properties. This is more reliable across browsers when the mask image is passed through a CSS variable.
- Fixed invisible `Interests` icons by removing the self-referential `color: currentColor` override from `.site-icon` and adding explicit card accent color overrides after `main_style.css`.
- Fixed icon 404s caused by CSS variable URL resolution. Because `--site-icon` is consumed by `assets/css/fix.css`, relative mask URLs are resolved relative to `assets/css/`. Changed icon paths in `index.html` from `assets/icons/...` to `../icons/...` and brand paths from `assets/images/...` to `../images/...`.
- Verification:
  - `index.html` has no remaining `im-*` or `iconmonstr` references.
  - `assets/icons/site-icons.svg` parses as valid XML.
  - All 15 unique `site-icons.svg#...` IDs used in `index.html` exist in the sprite.
  - `node --check assets/js/public.js` passes.
