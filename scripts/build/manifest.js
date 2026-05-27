import fs from 'fs';
import * as cheerio from 'cheerio';

export function getInlineManifestHref(manifestPath) {
  const manifestBuffer = fs.readFileSync(manifestPath);
  return `data:application/manifest+json;base64,${manifestBuffer.toString('base64')}`;
}

export function injectInlineManifest($, inlineHref) {
  upsertHeadLink($, 'link[rel="manifest"]', { rel: 'manifest', href: inlineHref });
}

export function renderNotFoundHtml(notFoundPath, inlineHref) {
  const notFoundRawHtml = fs.readFileSync(notFoundPath, 'utf8');
  const $notFound = cheerio.load(notFoundRawHtml, { decodeEntities: false });
  injectInlineManifest($notFound, inlineHref);
  return $notFound.html();
}

function removeExtraMatches($, selector) {
  const matches = $(selector);
  matches.slice(1).remove();
  return matches.first();
}

function upsertHeadLink($, selector, attributes) {
  const link = removeExtraMatches($, selector);

  if (link.length) {
    Object.entries(attributes).forEach(([key, value]) => link.attr(key, value));
    return;
  }

  $('<link>').attr(attributes).appendTo('head');
}

