#!/usr/bin/env node
// Minimal SPA-aware static server for Playwright tests.
// Serves real files by path; falls back to index.html for unknown routes.
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 4000;
const ROOT = path.resolve(__dirname, '..');
const MIME = {
  html: 'text/html; charset=utf-8',
  js:   'application/javascript',
  css:  'text/css',
  png:  'image/png',
  ico:  'image/x-icon',
  svg:  'image/svg+xml',
  json: 'application/json',
};

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0].replace(/\/+$/, '') || '/';
  const candidate = path.join(ROOT, urlPath);

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate).slice(1).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(candidate).pipe(res);
  } else {
    // SPA fallback — let index.html handle the route
    res.writeHead(200, { 'Content-Type': MIME.html });
    fs.createReadStream(path.join(ROOT, 'index.html')).pipe(res);
  }
}).listen(PORT, () => console.log(`Test server: http://localhost:${PORT}/`));
