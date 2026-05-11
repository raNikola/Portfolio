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

fs.mkdirSync('./dist', { recursive: true });
fs.writeFileSync(outputPath, $.html(), 'utf8');
fs.cpSync('./assets', './dist/assets', { recursive: true });
fs.copyFileSync('./manifest.json', './dist/manifest.json');
fs.copyFileSync('./favicon.ico', './dist/favicon.ico');

console.log('Build completed: dist/index.html');
