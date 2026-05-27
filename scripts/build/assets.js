import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

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
  const content = fs.readFileSync(sourcePath, 'utf8');
  const transformed = transform(content);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, transformed, 'utf8');
}

function minifyThemeBootstrap(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();=?:,])\s*/g, '$1')
    .replace(/;}/g, '}');
}

export function copyProductionAssets({
  distPath,
  renderedHtml,
  buildEnvironment,
  themeBootstrapPath
}) {
  const assetPaths = new Set([
    'assets/css/main.css',
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

export function copyStaticFile(sourcePath, destinationPath) {
  copyFile(sourcePath, destinationPath);
}

export function toDistPath(distPath, assetPath) {
  return path.join(distPath, toPosixPath(assetPath));
}
