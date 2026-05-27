# Templates Scaffold (Phase 1)

This folder is a non-wired scaffold for the planned `Layout + Feature-Template` architecture.

Current build output is unchanged. Existing rendering still uses:
- `index.template.html`
- `scripts/build.js`
- `scripts/sections/*.js`

## Planned mapping

- `data/site.json` -> `templates/layout/*`, `templates/features/navigation.template.html`
- `data/about.json` -> `templates/features/about.template.html`
- `data/skills.json` -> `templates/features/skills.template.html`
- `data/experience.json` -> `templates/features/experience.template.html`
- `data/references.json` -> `templates/features/references.template.html`
- `data/interests.json` -> `templates/features/interests.template.html`

## Notes

- Legacy files `templates/education.html` and `templates/expirience.html` are left untouched in this phase.
- Wiring begins in Phase 2 (pilot migration).

