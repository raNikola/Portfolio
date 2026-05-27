import fs from 'fs';
import * as cheerio from 'cheerio';

function loadTemplateFragment(templatePath) {
  if (!fs.existsSync(templatePath)) {
    return '';
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  return cheerio.load(templateHtml, { decodeEntities: false }).root().html() || '';
}

export function injectAboutTemplate($, aboutTemplatePath) {
  const fragment = loadTemplateFragment(aboutTemplatePath);
  if (!fragment.trim()) {
    return;
  }

  $('.header__container').html(fragment);
}

export function injectNavigationTemplate($, navigationTemplatePath) {
  const fragment = loadTemplateFragment(navigationTemplatePath);
  if (!fragment.trim()) {
    return;
  }

  const navigationPlaceholder = $('.header__navbar').first();
  if (!navigationPlaceholder.length) {
    return;
  }

  navigationPlaceholder.replaceWith(fragment);
  $('header .sidenav#mobile-nav').slice(1).remove();
}

export function injectFeatureTemplate($, selector, templatePath) {
  const fragment = loadTemplateFragment(templatePath);
  if (!fragment.trim()) {
    return;
  }

  const target = $(selector).first();
  if (!target.length) {
    return;
  }

  target.replaceWith(fragment);
}

