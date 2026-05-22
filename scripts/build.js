import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

import { renderAbout } from './sections/render-about.js';
import { renderSkills } from './sections/render-skills.js';
import {renderInterests} from './sections/render-interests.js';
import {renderReferences} from './sections/render-references.js';
import {renderExperience} from './sections/render-experience.js';
import {renderDesktopNavigation, renderMobileNavigation} from './partials/render-navigation.js';

const templatePath = './index.template.html';
const outputPath = './dist/index.html';
const distPath = './dist';
const clarityScriptOutputPath = './dist/assets/js/clarity.js';
const themeBootstrapPath = 'assets/js/theme-bootstrap.js';
const shouldDeleteDist = process.argv.includes('--delete-dist');
const cspMetaSelector = 'meta[http-equiv="Content-Security-Policy"]';
const clarityProjectIdEnvKey = 'MICROSOFT_CLARITY_PROJECT_ID';
const umamiWebsiteIdEnvKey = 'UMAMI_WEBSITE_ID';
const umamiScriptOrigin = 'https://cloud.umami.is';
const umamiScriptSrc = `${umamiScriptOrigin}/script.js`;
let cleanMode = 'cleaned dist contents';

loadLocalEnvironment();

const html = fs.readFileSync(templatePath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });
const siteConfig = JSON.parse(fs.readFileSync('./data/site.json', 'utf8'));
const buildEnvironment = getBuildEnvironment();
const structuredDataJson = getStructuredDataJson(siteConfig);
const clarityConfig = getClarityConfig(buildEnvironment);
const umamiConfig = getUmamiConfig(buildEnvironment);

renderAbout($);
renderSkills($);
renderExperience($);
renderInterests($)
renderReferences($)

renderNavigation($, siteConfig.navigation || []);
injectHeadMetadata($, siteConfig);
injectStructuredData($, structuredDataJson);
injectUmamiScript($, umamiConfig);
injectClarityScript($, clarityConfig);
injectContentSecurityPolicy($, buildEnvironment, siteConfig, structuredDataJson, clarityConfig, umamiConfig);

const renderedHtml = $.html();

function loadLocalEnvironment() {
    const envPath = './.env.local';

    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmedLine.indexOf('=');

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

function getBuildEnvironment() {
    const envArg = process.argv.find(arg => arg.startsWith('--env='));
    const explicitEnv = envArg ? envArg.split('=')[1] : process.env.NODE_ENV;

    if (explicitEnv === 'production' || explicitEnv === 'prod') {
        return 'production';
    }

    if (explicitEnv === 'development'
        || explicitEnv === 'dev'
        || explicitEnv === 'local'
        || explicitEnv === 'staging'
        || explicitEnv === 'stage'
        || explicitEnv === 'preview'
        || explicitEnv === 'test') {
        return 'development';
    }

    if (process.env.npm_lifecycle_event === 'build'
        || process.env.npm_lifecycle_event === 'build:html'
        || process.env.npm_lifecycle_event === 'build:clean') {
        return 'production';
    }

    return 'development';
}

function normalizeSiteUrl(siteUrl) {
    return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

function renderNavigation($, navigationItems) {
    const profileTrigger = $('#site-navigation-links .sidenav-about').closest('li');
    const profileTriggerHtml = profileTrigger.length ? $.html(profileTrigger) : '';

    $('#site-navigation-links').html(`${renderDesktopNavigation(navigationItems)}${profileTriggerHtml}`);
    $('#mobile-nav').html(renderMobileNavigation(navigationItems));
}

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

function injectHeadMetadata($, config) {
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

function getStructuredDataJson(config) {
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

function injectStructuredData($, structuredDataJson) {
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

function getClarityConfig(environment) {
    const projectId = (process.env[clarityProjectIdEnvKey] || '').trim();

    return {
        enabled: environment === 'production' && Boolean(projectId),
        projectId,
        scriptPath: './assets/js/clarity.js'
    };
}

function getUmamiConfig(environment) {
    const websiteId = (process.env[umamiWebsiteIdEnvKey] || '').trim();

    return {
        enabled: environment === 'production' && Boolean(websiteId),
        websiteId,
        scriptSrc: umamiScriptSrc
    };
}

function injectUmamiScript($, umami) {
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

function injectClarityScript($, clarity) {
    const existingScript = removeExtraMatches($, 'script#ms-clarity');

    if (!clarity.enabled) {
        existingScript.remove();
        return;
    }

    const attributes = {
        id: 'ms-clarity',
        defer: '',
        src: clarity.scriptPath
    };

    if (existingScript.length) {
        Object.entries(attributes).forEach(([key, value]) => existingScript.attr(key, value));
        return;
    }

    $('<script>').attr(attributes).appendTo('head');
}

function getClarityLoader(projectId) {
    return [
        '(function(c,l,a,r,i,t,y){',
        'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};',
        't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;',
        'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);',
        `})(window,document,"clarity","script",${JSON.stringify(projectId)});`,
        ''
    ].join('\n');
}

function getContentSecurityPolicy(environment, config, structuredDataJson, clarity, umami) {
    const isDevelopment = environment === 'development';
    const scriptSources = isDevelopment ? [`'self'`, `'unsafe-inline'`] : [`'self'`];
    const connectSources = isDevelopment
        ? [`'self'`, 'ws:', 'http://localhost:*', 'http://127.0.0.1:*']
        : [`'self'`];
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
        directives.push(`frame-ancestors 'none'`);
    }

    directives.push('upgrade-insecure-requests');
    return directives.join('; ');
}

function injectContentSecurityPolicy($, environment, config, structuredDataJson, clarity, umami) {
    const policy = getContentSecurityPolicy(environment, config, structuredDataJson, clarity, umami);
    const existingCspTags = $(cspMetaSelector);
    const cspTag = existingCspTags.first();

    existingCspTags.slice(1).remove();

    if (cspTag.length) {
        cspTag.attr('content', policy);
        return;
    }

    $('head').prepend(`<meta http-equiv="Content-Security-Policy" content="${policy}">`);
}

function toPosixPath(value) {
    return value.split(path.sep).join('/');
}

function isCopyableUrl(value) {
    return value
        && !value.startsWith('#')
        && !value.startsWith('data:')
        && !value.startsWith('mailto:')
        && !value.startsWith('tel:')
        && !/^[a-z]+:\/\//i.test(value);
}

function normalizeAssetPath(value, baseDir = '') {
    if (!isCopyableUrl(value)) {
        return null;
    }

    const cleanValue = value.split('#')[0].split('?')[0];
    let normalized = cleanValue.startsWith('/')
        ? cleanValue.slice(1)
        : toPosixPath(path.posix.normalize(path.posix.join(baseDir, cleanValue)));

    if (normalized.startsWith('./')) {
        normalized = normalized.slice(2);
    }

    return normalized.startsWith('assets/') ? normalized : null;
}

function collectUrlsFromText(text) {
    const urls = [];
    const urlPattern = /url\((['"]?)([^'")]+)\1\)/g;
    let match;

    while ((match = urlPattern.exec(text)) !== null) {
        urls.push(match[2].trim());
    }

    return urls;
}

function collectSrcsetAssetPaths(value) {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map(candidate => candidate.trim().split(/\s+/)[0])
        .map(candidate => normalizeAssetPath(candidate))
        .filter(Boolean);
}

function copyFile(sourcePath, destinationPath) {
    if (!fs.existsSync(sourcePath)) {
        return;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
}

function copyTextFile(sourcePath, destinationPath, transform = (content) => content) {
    if (!fs.existsSync(sourcePath)) {
        return;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(destinationPath, transform(content), 'utf8');
}

function minifyThemeBootstrap(content) {
    return content
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}();=?:,])\s*/g, '$1')
        .replace(/;}/g, '}');
}

function writeCrawlerFiles() {
    const lastmod = new Date().toISOString().slice(0, 10);
    const siteUrl = normalizeSiteUrl(siteConfig.siteUrl);
    const profileSummary = siteConfig.description;

    fs.writeFileSync(
        './dist/robots.txt',
        [
            'User-agent: *',
            'Allow: /',
            `Sitemap: ${siteUrl}sitemap.xml`,
            ''
        ].join('\n'),
        'utf8'
    );

    fs.writeFileSync(
        './dist/sitemap.xml',
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            '  <url>',
            `    <loc>${siteUrl}</loc>`,
            `    <lastmod>${lastmod}</lastmod>`,
            '    <changefreq>monthly</changefreq>',
            '    <priority>1.0</priority>',
            '  </url>',
            '</urlset>',
            ''
        ].join('\n'),
        'utf8'
    );

    fs.writeFileSync(
        './dist/llms.txt',
        [
            '# Nikola Randjelovic',
            '',
            `Role: ${siteConfig.person.jobTitle} | B2B SaaS Platforms`,
            `Summary: ${profileSummary}`,
            '',
            `Primary URL: ${siteUrl}`,
            `Location: ${siteConfig.person.addressLocality}, ${siteConfig.person.addressCountry}`,
            'Core topics:',
            ...siteConfig.person.knowsAbout.map(topic => `- ${topic}`),
            `Contact: ${siteConfig.person.email}`,
            ...siteConfig.person.sameAs.map(url => `Profile: ${url}`),
            ''
        ].join('\n'),
        'utf8'
    );

    fs.writeFileSync(
        './dist/ai.txt',
        [
            'Site owner: Nikola Randjelovic',
            profileSummary,
            'Use the public profile pages, structured data, sitemap, and resume to understand the professional profile.',
            ''
        ].join('\n'),
        'utf8'
    );

    fs.writeFileSync(
        './dist/humans.txt',
        [
            '/* TEAM */',
            `Owner: ${siteConfig.person.name}`,
            `Role: ${siteConfig.person.jobTitle}`,
            `Site: ${siteUrl}`,
            `Contact: ${siteConfig.person.email}`,
            '',
            '/* SITE */',
            'Purpose: Personal portfolio for technical product leadership, B2B SaaS platforms, and product execution experience.',
            'Language: English',
            ''
        ].join('\n'),
        'utf8'
    );
}

function cleanDist() {
    fs.mkdirSync(distPath, { recursive: true });

    for (const entry of fs.readdirSync(distPath)) {
        fs.rmSync(path.join(distPath, entry), { recursive: true, force: true });
    }
}

function recreateDist() {
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
        cleanMode = 'created dist';
        return;
    }

    try {
        fs.rmSync(distPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
        cleanMode = 'deleted and recreated dist';
    } catch (error) {
        if (error?.code !== 'EPERM' && error?.code !== 'EBUSY') {
            throw error;
        }

        cleanDist();
        cleanMode = `cleaned dist contents after ${error.code} prevented deleting the dist folder`;
    }

    fs.mkdirSync(distPath, { recursive: true });
}

function copyProductionAssets() {
    const assetPaths = new Set([
        'assets/css/materialize.min.css',
        'assets/css/main.css',
        'assets/js/materialize.min.js',
        'assets/js/particles.min.js',
        'assets/js/public.js',
        'assets/particles.json',
        'assets/data/person.schema.json',
        'assets/files/CV_Nikola_Randjelovic.pdf'
    ]);

    if (buildEnvironment === 'development' && fs.existsSync('assets/css/main.css.map')) {
        assetPaths.add('assets/css/main.css.map');
    }

    const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
    for (const icon of manifest.icons || []) {
        const iconPath = normalizeAssetPath(icon.src);
        if (iconPath) {
            assetPaths.add(iconPath);
        }
    }

    const htmlForAssets = cheerio.load(renderedHtml, { decodeEntities: false });
    htmlForAssets('[href], [src], [srcset], [imagesrcset]').each((_, element) => {
        const href = htmlForAssets(element).attr('href');
        const src = htmlForAssets(element).attr('src');
        const srcset = htmlForAssets(element).attr('srcset');
        const imageSrcset = htmlForAssets(element).attr('imagesrcset');
        const hrefPath = normalizeAssetPath(href);
        const srcPath = normalizeAssetPath(src);

        if (hrefPath) {
            assetPaths.add(hrefPath);
        }

        if (srcPath) {
            assetPaths.add(srcPath);
        }

        for (const srcsetPath of collectSrcsetAssetPaths(srcset)) {
            assetPaths.add(srcsetPath);
        }

        for (const srcsetPath of collectSrcsetAssetPaths(imageSrcset)) {
            assetPaths.add(srcsetPath);
        }
    });

    for (const url of collectUrlsFromText(renderedHtml)) {
        const assetPath = normalizeAssetPath(url, 'assets/css');
        if (assetPath) {
            assetPaths.add(assetPath);
        }
    }

    const cssFiles = [...assetPaths].filter(assetPath => assetPath.endsWith('.css'));
    for (const cssFile of cssFiles) {
        const css = fs.readFileSync(cssFile, 'utf8');
        for (const url of collectUrlsFromText(css)) {
            const assetPath = normalizeAssetPath(url, path.posix.dirname(cssFile));
            if (assetPath) {
                assetPaths.add(assetPath);
            }
        }
    }

    for (const assetPath of assetPaths) {
        const destination = path.join(distPath, assetPath);

        if (assetPath === 'assets/css/main.css' && buildEnvironment === 'production') {
            copyTextFile(assetPath, destination, content => content.replace(/\/\*# sourceMappingURL=.*?\*\/\s*$/s, ''));
            continue;
        }

        if (assetPath === themeBootstrapPath && buildEnvironment === 'production') {
            copyTextFile(assetPath, destination, minifyThemeBootstrap);
            continue;
        }

        copyFile(assetPath, destination);
    }
}

function writeProductionClarityScript(clarity) {
    if (!clarity.enabled) {
        return;
    }

    fs.mkdirSync(path.dirname(clarityScriptOutputPath), { recursive: true });
    fs.writeFileSync(clarityScriptOutputPath, getClarityLoader(clarity.projectId), 'utf8');
}

if (shouldDeleteDist) {
    recreateDist();
} else {
    cleanDist();
}

fs.writeFileSync(outputPath, renderedHtml, 'utf8');
copyProductionAssets();
writeProductionClarityScript(clarityConfig);
copyFile('./404.html', './dist/404.html');
copyFile('./assets/images/404/spacecraft.png', './dist/assets/images/404/spacecraft.png');
copyFile('./assets/images/404/deadstar_planet.png', './dist/assets/images/404/deadstar_planet.png');
copyFile('./manifest.json', './dist/manifest.json');
copyFile('./favicon.ico', './dist/favicon.ico');
copyFile('./assets/data/person.schema.json', './dist/person.jsonld');
writeCrawlerFiles();

console.log(`Build completed: dist/index.html (${cleanMode})`);
