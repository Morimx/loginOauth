// middleware/iframe-proxy.js
const express = require('express');
const fetch = require('node-fetch');

async function iframeProxyMiddleware(req, res, next) {
  if (req.path.startsWith('/proxy-iframe')) {
    try {
      const iframeUrl = req.query.url;
      const response = await fetch(iframeUrl);
      let content = await response.text();

      // Inyectar scripts de seguridad en el contenido del iframe
      const securityScripts = `
        <script>
          document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
          });

          document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
               (e.ctrlKey && e.shiftKey && e.key === 'I') ||
               (e.ctrlKey && e.shiftKey && e.key === 'C') ||
               (e.ctrlKey && e.shiftKey && e.key === 'J') ||
               (e.ctrlKey && e.key === 'u')) {
              e.preventDefault();
            }
          });
        </script>
        <style>
          * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        </style>
      `;

      content = content.replace('</head>', `${securityScripts}</head>`);
      
      // Establecer los headers apropiados
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } catch (error) {
      console.error('Error en el proxy del iframe:', error);
      res.status(500).send('Error al cargar el contenido del iframe');
    }
  } else {
    next();
  }
}

module.exports = iframeProxyMiddleware;