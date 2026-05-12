import fs from 'fs';
import * as cheerio from 'cheerio';

import { renderSkills } from './sections/render-skills.js';
import {renderInterests} from './sections/render-interests.js';
import {renderReferences} from './sections/render-references.js';
import {renderExperience} from './sections/render-experience.js';

const templatePath = './index.template.html';
const outputPath = './dist/index.html';

const html = fs.readFileSync(templatePath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

renderSkills($);
renderExperience($);
renderInterests($)
renderReferences($)

const structuredData = $('script[type="application/ld+json"]').html();
if (structuredData) {
    const { createHash } = await import('crypto');
    const structuredDataHash = createHash('sha256').update(structuredData, 'utf8').digest('base64');

    $('meta[http-equiv="Content-Security-Policy"]').attr(
        'content',
        `default-src 'self'; script-src 'self' 'sha256-${structuredDataHash}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
    );
}

fs.mkdirSync('./dist', { recursive: true });
fs.writeFileSync(outputPath, $.html(), 'utf8');
fs.cpSync('./assets', './dist/assets', { recursive: true });
fs.copyFileSync('./manifest.json', './dist/manifest.json');
fs.copyFileSync('./favicon.ico', './dist/favicon.ico');

console.log('Build completed: dist/index.html');
