#!/usr/bin/env node
// tools/generate-sitemap.js
// Scans demo/public directory and generates sitemap.xml and updates robots.txt sitemap entry.

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'demo', 'public');
const BASE_URL = 'https://OptixTweak.github.io';

// Prioritäten für bekannte Seiten (je wichtiger desto höher)
const PRIORITIES = {
  'index.html': 1.0,
  'products.html': 0.9,
  'product.html': 0.8,
  'faq.html': 0.6,
  'downloads.html': 0.7,
  'support.html': 0.5,
  'impressum.html': 0.2,
  'datenschutz.html': 0.2,
  'privacy.html': 0.2,
  '404.html': 0.1
};

function listHtmlFiles(dir){
  return fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
}

function buildSitemap(files){
  const urls = files.map(f=>{
    const loc = (f==='index.html') ? `${BASE_URL}/` : `${BASE_URL}/public/${f}`;
    const priority = PRIORITIES[f] || 0.5;
    return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function writeRobots(){
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  const sitemapUrl = `${BASE_URL}/public/sitemap.xml`;
  const content = `User-agent: *\nDisallow:\nSitemap: ${sitemapUrl}\n`;
  fs.writeFileSync(robotsPath, content, 'utf8');
  console.log('Wrote', robotsPath);
}

function main(){
  const files = listHtmlFiles(PUBLIC_DIR);
  const sitemap = buildSitemap(files);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Generated sitemap.xml with', files.length, 'entries');
  writeRobots();
}

main();

