import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT, 'scripts', 'sections'),
  path.join(ROOT, 'scripts', 'partials')
];

// Heuristic guardrail: disallow HTML template strings and direct HTML string injections
// in build-time render/bind modules. Markup should live in `templates/**`.
const DISALLOWED_PATTERNS = [
  { name: 'template-literal-with-tag', re: /`[\s\S]*?<[^>]+>[\s\S]*?`/m },
  { name: 'jquery-html-template-literal', re: /\.html\s*\(\s*`/m },
  { name: 'jquery-append-template-literal', re: /\.(append|prepend|before|after)\s*\(\s*`/m }
];

function listJsFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRepoPath(fullPath) {
  return path.relative(ROOT, fullPath).replaceAll('\\', '/');
}

const violations = [];

for (const dirPath of TARGET_DIRS) {
  for (const filePath of listJsFiles(dirPath)) {
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of DISALLOWED_PATTERNS) {
      if (pattern.re.test(content)) {
        violations.push({
          file: toRepoPath(filePath),
          rule: pattern.name
        });
        break;
      }
    }
  }
}

if (violations.length) {
  console.error('HTML-in-JS guardrail failed. Move markup to templates/** and bind via Cheerio at build time.');
  for (const v of violations) {
    console.error(`- ${v.file} (${v.rule})`);
  }
  process.exit(1);
}

