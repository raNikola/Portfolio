# Local Lucide Icons

This folder contains the full local Lucide SVG icon set copied from `lucide-static`.

Use these files directly when you want to choose or replace icons manually.

## Basic Usage

```html
<img src="assets/icons/lucide/save.svg" alt="" class="lucide-img-icon" aria-hidden="true">
```

This is the easiest option, but CSS cannot reliably recolor the SVG stroke when it is loaded through `<img>`.

## Current Mask Usage In `index.html`

The working `index.html` uses CSS masks so icons can be recolored with normal CSS text colors:

```html
<span class="site-icon"
      style="--site-icon: url('../icons/lucide/save.svg')"
      aria-hidden="true"></span>
```

To change the icon, change only the file path:

```html
style="--site-icon: url('../icons/lucide/download.svg')"
```

Important: this URL is resolved from the CSS file that consumes the variable, currently `assets/css/fix.css`. That is why the path starts with `../icons/`, not `assets/icons/`.

For social brand icons, the page currently uses existing local brand SVG files:

```html
style="--site-icon: url('assets/images/github.svg')"
```

## Recommended Usage When Color Must Follow CSS

Open the SVG file you want, copy its `<svg>...</svg>` markup, and paste it into the HTML where the icon should appear.

Keep or set:

```html
stroke="currentColor"
```

That lets the icon inherit color from CSS.

## Existing Sprite

The project also has:

```text
assets/icons/site-icons.svg
```

That file is a small optimized sprite for icons already migrated in `index.html`.
It is optional. For manual icon exploration, use the SVG files in this folder.
