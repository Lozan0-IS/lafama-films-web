// Servidor local para ver el sitio y el panel admin antes de subirlo a hosting.
// Uso: node servidor-local.js   (luego abre las URLs que imprime)
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const PORT = 8934;
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const full = path.join(root, p);
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); res.end('No encontrado: ' + p); return; }
    const ext = path.extname(full);
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('');
  console.log('LaFama Films — servidor local corriendo:');
  console.log('  Sitio público:  http://localhost:' + PORT + '/');
  console.log('  Panel Admin:    http://localhost:' + PORT + '/Panel%20Admin.dc.html');
  console.log('');
  console.log('Ctrl+C para detenerlo.');
});
