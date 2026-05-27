import * as cheerio from 'cheerio';

function removeExtraMatches($, selector) {
  const matches = $(selector);
  matches.slice(1).remove();
  return matches.first();
}

function upsertMeta($, selector, attributes) {
  const meta = removeExtraMatches($, selector);

  if (meta.length) {
    Object.entries(attributes).forEach(([key, value]) => meta.attr(key, value));
    return;
  }

  $('<meta>').attr(attributes).appendTo('head');
}

function upsertHeadLink($, selector, attributes) {
  const link = removeExtraMatches($, selector);

  if (link.length) {
    Object.entries(attributes).forEach(([key, value]) => link.attr(key, value));
    return;
  }

  $('<link>').attr(attributes).appendTo('head');
}

function normalizeSiteUrl(siteUrl) {
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

export function injectHeadMetadata($, config) {
  const siteUrl = normalizeSiteUrl(config.siteUrl);

  $('meta[name="keywords"], meta[name="googlebot"], meta[property^="profile:"]').remove();

  $('title').first().text(config.title);
  $('title').slice(1).remove();

  upsertMeta($, 'meta[name="description"]', { name: 'description', content: config.description });
  upsertMeta($, 'meta[name="robots"]', {
    name: 'robots',
    content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  });
  upsertMeta($, 'meta[name="author"]', { name: 'author', content: config.author });
  upsertMeta($, 'meta[name="theme-color"]', { name: 'theme-color', content: config.themeColor });
  upsertMeta($, 'meta[name="viewport"]', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' });
  upsertHeadLink($, 'link[rel="canonical"]', { rel: 'canonical', href: siteUrl });
  $('link[rel="me"]').remove();
  config.person.sameAs.forEach(url => $('<link>').attr({ rel: 'me', href: url }).appendTo('head'));

  upsertMeta($, 'meta[property="og:title"]', { property: 'og:title', content: config.title });
  upsertMeta($, 'meta[property="og:description"]', { property: 'og:description', content: config.description });
  upsertMeta($, 'meta[property="og:type"]', { property: 'og:type', content: 'website' });
  upsertMeta($, 'meta[property="og:url"]', { property: 'og:url', content: siteUrl });
  upsertMeta($, 'meta[property="og:site_name"]', { property: 'og:site_name', content: config.siteName });
  upsertMeta($, 'meta[property="og:image"]', { property: 'og:image', content: config.ogImage });
  upsertMeta($, 'meta[property="og:image:alt"]', { property: 'og:image:alt', content: config.ogImageAlt });
  upsertMeta($, 'meta[property="og:locale"]', { property: 'og:locale', content: config.locale });

  upsertMeta($, 'meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta($, 'meta[name="twitter:title"]', { name: 'twitter:title', content: config.title });
  upsertMeta($, 'meta[name="twitter:description"]', { name: 'twitter:description', content: config.description });
  upsertMeta($, 'meta[name="twitter:image"]', { name: 'twitter:image', content: config.ogImage });
}

export function getStructuredDataJson(config) {
  const siteUrl = normalizeSiteUrl(config.siteUrl);
  const person = config.person;
  const personId = `${siteUrl}#nikola-randjelovic`;
  const websiteId = `${siteUrl}#website`;
  const pageId = `${siteUrl}#profile-page`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: person.name,
        alternateName: person.alternateName,
        jobTitle: person.jobTitle,
        email: person.email,
        url: person.url,
        address: {
          '@type': 'PostalAddress',
          addressLocality: person.addressLocality,
          addressCountry: person.addressCountry
        },
        sameAs: person.sameAs,
        knowsAbout: person.knowsAbout
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: config.siteName,
        description: config.description,
        inLanguage: 'en',
        publisher: {
          '@id': personId
        }
      },
      {
        '@type': 'ProfilePage',
        '@id': pageId,
        url: siteUrl,
        name: config.title,
        description: config.description,
        isPartOf: {
          '@id': websiteId
        },
        mainEntity: {
          '@id': personId
        }
      }
    ]
  }, null, 2);
}

export function injectStructuredData($, structuredDataJson) {
  const script = removeExtraMatches($, 'script#site-structured-data');

  if (script.length) {
    script.attr('type', 'application/ld+json').text(structuredDataJson);
    return;
  }

  $('<script>')
    .attr({ id: 'site-structured-data', type: 'application/ld+json' })
    .text(structuredDataJson)
    .appendTo('head');
}

export function getUmamiConfig(environment, {
  umamiWebsiteIdEnvKey,
  umamiScriptSrc
}) {
  const websiteId = (process.env[umamiWebsiteIdEnvKey] || '').trim();

  return {
    enabled: environment === 'production' && Boolean(websiteId),
    websiteId,
    scriptSrc: umamiScriptSrc
  };
}

export function injectUmamiScript($, umami) {
  const existingScript = removeExtraMatches($, 'script#umami-analytics');

  if (!umami.enabled) {
    existingScript.remove();
    return;
  }

  const attributes = {
    id: 'umami-analytics',
    defer: '',
    src: umami.scriptSrc,
    'data-website-id': umami.websiteId
  };

  if (existingScript.length) {
    Object.entries(attributes).forEach(([key, value]) => existingScript.attr(key, value));
    return;
  }

  $('<script>').attr(attributes).appendTo('head');
}

export function getContentSecurityPolicy(environment, umami, { umamiScriptOrigin }) {
  const isDevelopment = environment === 'development';
  const scriptSources = isDevelopment ? [`'self'`, `'unsafe-inline'`] : [`'self'`];
  const connectSources = isDevelopment
    ? [`'self'`, 'ws:', 'http://localhost:*', 'http://127.0.0.1:*']
    : [`'self'`];

  if (!isDevelopment && umami.enabled) {
    scriptSources.push(umamiScriptOrigin);
    connectSources.push(umamiScriptOrigin, 'https://api-gateway.umami.dev');
  }
  const imageSources = [`'self'`, 'data:'];

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSources.join(' ')}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src ${imageSources.join(' ')}`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src ${connectSources.join(' ')}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`
  ];

  if (environment === 'production') {
    // directives.push(`frame-ancestors 'none'`);
  }

  directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

export function injectContentSecurityPolicy($, environment, umami, {
  cspMetaSelector,
  umamiScriptOrigin
}) {
  const policy = getContentSecurityPolicy(environment, umami, { umamiScriptOrigin });
  const existingCspTags = $(cspMetaSelector);
  const cspTag = existingCspTags.first();

  existingCspTags.slice(1).remove();

  if (cspTag.length) {
    cspTag.attr('content', policy);
    return;
  }

  $('head').prepend(`<meta http-equiv="Content-Security-Policy" content="${policy}">`);
}

