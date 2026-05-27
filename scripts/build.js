import fs from 'fs';
import * as cheerio from 'cheerio';

import { loadLocalEnvironment, getBuildEnvironment } from './build/env.js';
import { injectAboutTemplate, injectNavigationTemplate, injectFeatureTemplate } from './build/templates.js';
import { getInlineManifestHref, injectInlineManifest, renderNotFoundHtml } from './build/manifest.js';
import {
  injectHeadMetadata,
  getStructuredDataJson,
  injectStructuredData,
  getUmamiConfig,
  injectUmamiScript,
  injectContentSecurityPolicy
} from './build/head.js';
import { cleanDist, recreateDist } from './build/dist.js';
import { copyProductionAssets, copyStaticFile } from './build/assets.js';
import { writeCrawlerFiles } from './build/crawler.js';

import { bindAbout } from './sections/bind-about.js';
import { bindSkills } from './sections/bind-skills.js';
import { bindInterests } from './sections/bind-interests.js';
import { bindReferences } from './sections/bind-references.js';
import { bindExperience } from './sections/bind-experience.js';
import { bindNavigation } from './partials/bind-navigation.js';

const templatePath = './index.template.html';
const outputPath = './dist/index.html';
const distPath = './dist';
const themeBootstrapPath = 'assets/js/theme-bootstrap.js';
const shouldDeleteDist = process.argv.includes('--delete-dist');
const cspMetaSelector = 'meta[http-equiv="Content-Security-Policy"]';
const umamiWebsiteIdEnvKey = 'UMAMI_WEBSITE_ID';
const umamiScriptOrigin = 'https://cloud.umami.is';
const umamiScriptSrc = `${umamiScriptOrigin}/script.js`;

loadLocalEnvironment();

const html = fs.readFileSync(templatePath, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });
const siteConfig = JSON.parse(fs.readFileSync('./data/site.json', 'utf8'));
const inlineManifestHref = getInlineManifestHref('./manifest.json');
const buildEnvironment = getBuildEnvironment();
const structuredDataJson = getStructuredDataJson(siteConfig);
const umamiConfig = getUmamiConfig(buildEnvironment, { umamiWebsiteIdEnvKey, umamiScriptSrc });

injectNavigationTemplate($, './templates/features/navigation.template.html');
injectAboutTemplate($, './templates/features/about.template.html');
injectFeatureTemplate($, '#skills', './templates/features/skills.template.html');
injectFeatureTemplate($, '#experience', './templates/features/experience.template.html');
injectFeatureTemplate($, '#references', './templates/features/references.template.html');
injectFeatureTemplate($, '#interests', './templates/features/interests.template.html');

bindAbout($);
bindSkills($);
bindExperience($);
bindInterests($);
bindReferences($);

bindNavigation($, siteConfig.navigation || []);
injectHeadMetadata($, siteConfig);
injectStructuredData($, structuredDataJson);
injectUmamiScript($, umamiConfig);
injectContentSecurityPolicy($, buildEnvironment, umamiConfig, { cspMetaSelector, umamiScriptOrigin });
injectInlineManifest($, inlineManifestHref);

const renderedHtml = $.html();
const renderedNotFoundHtml = renderNotFoundHtml('./404.html', inlineManifestHref);

const cleanMode = shouldDeleteDist ? recreateDist(distPath) : cleanDist(distPath);

fs.writeFileSync(outputPath, renderedHtml, 'utf8');
copyProductionAssets({ distPath, renderedHtml, buildEnvironment, themeBootstrapPath });
fs.writeFileSync('./dist/404.html', renderedNotFoundHtml, 'utf8');
copyStaticFile('./assets/images/404/spacecraft.png', './dist/assets/images/404/spacecraft.png');
copyStaticFile('./assets/images/404/deadstar_planet.png', './dist/assets/images/404/deadstar_planet.png');
copyStaticFile('./manifest.json', './dist/manifest.json');
copyStaticFile('./favicon.ico', './dist/favicon.ico');
copyStaticFile('./assets/data/person.schema.json', './dist/person.jsonld');
writeCrawlerFiles(distPath, siteConfig);

console.log(`Build completed: dist/index.html (${cleanMode})`);
