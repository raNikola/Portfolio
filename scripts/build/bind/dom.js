import * as cheerio from 'cheerio';

export function loadFragmentFromFile(fs, templatePath) {
  if (!fs.existsSync(templatePath)) {
    return '';
  }

  const html = fs.readFileSync(templatePath, 'utf8');
  return cheerio.load(html, { decodeEntities: false }).root().html() || '';
}

export function cloneTemplate($, selector) {
  const template = $(selector).first();
  if (!template.length) {
    return null;
  }

  // Cheerio clone keeps attributes; we keep `data-tpl` on clones for now.
  // The binder that uses this should remove the original prototype after cloning.
  return template.clone();
}

export function setText(node, value) {
  node.text(value == null ? '' : String(value));
}

export function setAttr(node, name, value) {
  if (value == null || value === '') {
    node.removeAttr(name);
    return;
  }
  node.attr(name, String(value));
}

