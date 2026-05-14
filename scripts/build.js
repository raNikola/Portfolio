import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

import { renderAbout } from './sections/render-about.js';
import { renderSkills } from './sections/render-skills.js';
import {renderInterests} from './sections/render-interests.js';
import {renderReferences} from './sections/render-references.js';
import {renderExperience} from './sections/render-experience.js';

const siteUrl = 'https://cv.ranikola.dev/';
const templatePath = './index.template.html';
const outputPath = './dist/index.html';
const distPath = './dist';
const shouldDeleteDist = process.argv.includes('--delete-dist');
let cleanMode = 'cleaned dist contents';

const html = fs.readFileSync(templatePath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

renderAbout($);
renderSkills($);
renderExperience($);
renderInterests($)
renderReferences($)

$('meta[http-equiv="Content-Security-Policy"]').attr(
    'content',
    `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
);

const renderedHtml = $.html();

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

function writeCrawlerFiles() {
    const lastmod = new Date().toISOString().slice(0, 10);
    const profileSummary = `Nikola Randjelovic is a Product Manager based in Nis, Serbia, focused on systems and platform delivery for B2B products. He combines a software engineering background with MVP definition, roadmap execution, cross-team coordination, Agile delivery, API-driven systems, and AI-assisted product workflows.`;

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
            profileSummary,
            '',
            'Primary URL: https://cv.ranikola.dev/',
            'Role: Product Manager | Systems & Platform Delivery',
            'Location: Nis, Serbia',
            'Core topics: B2B product delivery, MVP definition, roadmap planning, Agile delivery, cross-functional execution, API-driven platforms, Jira, Monday.com, Figma, AI-assisted workflows.',
            'Contact: hello@ranikola.dev',
            'LinkedIn: https://www.linkedin.com/in/ranikola',
            'GitHub: https://github.com/ranikola',
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
            'Owner: Nikola Randjelovic',
            'Role: Product Manager | Systems & Platform Delivery',
            'Site: https://cv.ranikola.dev/',
            'Contact: hello@ranikola.dev',
            '',
            '/* SITE */',
            'Purpose: Personal CV and product management portfolio',
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

    const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
    for (const icon of manifest.icons || []) {
        const iconPath = normalizeAssetPath(icon.src);
        if (iconPath) {
            assetPaths.add(iconPath);
        }
    }

    const htmlForAssets = cheerio.load(renderedHtml, { decodeEntities: false });
    htmlForAssets('[href], [src]').each((_, element) => {
        const href = htmlForAssets(element).attr('href');
        const src = htmlForAssets(element).attr('src');
        const hrefPath = normalizeAssetPath(href);
        const srcPath = normalizeAssetPath(src);

        if (hrefPath) {
            assetPaths.add(hrefPath);
        }

        if (srcPath) {
            assetPaths.add(srcPath);
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

        if (assetPath === 'assets/css/main.css') {
            copyTextFile(assetPath, destination, content => content.replace(/\/\*# sourceMappingURL=.*?\*\/\s*$/s, ''));
            continue;
        }

        copyFile(assetPath, destination);
    }
}

if (shouldDeleteDist) {
    recreateDist();
} else {
    cleanDist();
}

fs.writeFileSync(outputPath, renderedHtml, 'utf8');
copyProductionAssets();
copyFile('./404.html', './dist/404.html');
copyFile('./assets/images/404/spacecraft.png', './dist/assets/images/404/spacecraft.png');
copyFile('./assets/images/404/deadstar_planet.png', './dist/assets/images/404/deadstar_planet.png');
copyFile('./manifest.json', './dist/manifest.json');
copyFile('./favicon.ico', './dist/favicon.ico');
copyFile('./assets/data/person.schema.json', './dist/person.jsonld');
writeCrawlerFiles();

console.log(`Build completed: dist/index.html (${cleanMode})`);
