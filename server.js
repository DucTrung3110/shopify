const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.liquid': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function generateDirectoryListing(dirPath, urlPath) {
  const items = fs.readdirSync(dirPath);
  const folders = [];
  const files = [];
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      folders.push(item);
    } else {
      files.push(item);
    }
  });
  
  folders.sort();
  files.sort();
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopify Theme Browser - ${urlPath || '/'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { 
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .breadcrumb {
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .breadcrumb a { color: #0066cc; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .info-box {
      background: #e8f4fd;
      border: 1px solid #b3d9f7;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      color: #0066cc;
    }
    .file-list { 
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .file-item { 
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      text-decoration: none;
      color: #333;
      transition: background 0.2s;
    }
    .file-item:last-child { border-bottom: none; }
    .file-item:hover { background: #f8f9fa; }
    .file-icon {
      width: 24px;
      height: 24px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .folder .file-icon { color: #f0c040; }
    .file .file-icon { color: #666; }
    .file-name { flex: 1; }
    .file-type { 
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Shopify Theme Browser</h1>
    <div class="breadcrumb">`;
  
  const pathParts = urlPath.split('/').filter(Boolean);
  html += `<a href="/">Root</a>`;
  let currentPath = '';
  pathParts.forEach((part, i) => {
    currentPath += '/' + part;
    html += ` / <a href="${currentPath}">${part}</a>`;
  });
  
  html += `</div>
    <div class="info-box">
      This is a Shopify theme file browser. The theme requires Shopify's platform to run.
      Browse the files to view the AR implementation in <strong>snippets/ar-model-viewer.liquid</strong> and styles in <strong>assets/ar-styles.css</strong>.
    </div>
    <div class="file-list">`;
  
  if (urlPath && urlPath !== '/') {
    html += `<a href="${path.dirname(urlPath) || '/'}" class="file-item folder">
      <span class="file-icon">⬆️</span>
      <span class="file-name">..</span>
    </a>`;
  }
  
  folders.forEach(folder => {
    const itemPath = path.join(urlPath, folder);
    html += `<a href="${itemPath}" class="file-item folder">
      <span class="file-icon">📁</span>
      <span class="file-name">${folder}</span>
      <span class="file-type">folder</span>
    </a>`;
  });
  
  files.forEach(file => {
    const ext = path.extname(file).slice(1) || 'file';
    const itemPath = path.join(urlPath, file);
    html += `<a href="${itemPath}" class="file-item file">
      <span class="file-icon">📄</span>
      <span class="file-name">${file}</span>
      <span class="file-type">${ext}</span>
    </a>`;
  });
  
  html += `</div></div></body></html>`;
  return html;
}

function generateFileViewer(content, filePath) {
  const ext = path.extname(filePath);
  const langMap = {
    '.liquid': 'liquid',
    '.html': 'html',
    '.css': 'css',
    '.js': 'javascript',
    '.json': 'json'
  };
  const lang = langMap[ext] || 'plaintext';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${path.basename(filePath)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1e1e1e;
      color: #d4d4d4;
      min-height: 100vh;
    }
    .header {
      background: #252526;
      padding: 12px 20px;
      border-bottom: 1px solid #3c3c3c;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .back-link {
      color: #4fc3f7;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .back-link:hover { text-decoration: underline; }
    .filename {
      font-size: 14px;
      color: #fff;
    }
    .code-container {
      padding: 20px;
      overflow-x: auto;
    }
    pre {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .line-numbers {
      user-select: none;
      color: #858585;
      text-align: right;
      padding-right: 20px;
      border-right: 1px solid #3c3c3c;
      margin-right: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="${path.dirname(filePath) || '/'}" class="back-link">← Back</a>
    <span class="filename">${path.basename(filePath)}</span>
  </div>
  <div class="code-container">
    <pre>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '';
  
  const filePath = path.join(process.cwd(), urlPath);
  
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1>');
    return;
  }
  
  const stat = fs.statSync(filePath);
  
  if (stat.isDirectory()) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateDirectoryListing(filePath, urlPath || '/'));
    return;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  if (['.liquid', '.json'].includes(ext)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateFileViewer(content, urlPath));
    return;
  }
  
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mimeType });
  res.end(content);
});

server.listen(PORT, HOST, () => {
  console.log(`Shopify Theme Browser running at http://${HOST}:${PORT}`);
  console.log('Browse to view theme files and AR implementation');
});
