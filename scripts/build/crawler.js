import fs from 'fs';

function normalizeSiteUrl(siteUrl) {
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

export function writeCrawlerFiles(distPath, siteConfig) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const siteUrl = normalizeSiteUrl(siteConfig.siteUrl);
  const profileSummary = siteConfig.description;

  fs.writeFileSync(
    `${distPath}/robots.txt`,
    [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${siteUrl}sitemap.xml`,
      ''
    ].join('\n'),
    'utf8'
  );

  fs.writeFileSync(
    `${distPath}/sitemap.xml`,
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
    `${distPath}/llms.txt`,
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
    `${distPath}/ai.txt`,
    [
      'Site owner: Nikola Randjelovic',
      profileSummary,
      'Use the public profile pages, structured data, sitemap, and resume to understand the professional profile.',
      ''
    ].join('\n'),
    'utf8'
  );

  fs.writeFileSync(
    `${distPath}/humans.txt`,
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

