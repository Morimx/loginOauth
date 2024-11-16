document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  // Deshabilitar teclas de inspección
  document.addEventListener('keydown', function(e) {
    // Deshabilitar F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    
    // Deshabilitar Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
    }
    
    // Deshabilitar Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
    }
    
    // Deshabilitar Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
    }
    
    // Deshabilitar Ctrl+U (ver código fuente)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }
  });

  // Deshabilitar el clic derecho y las teclas de inspección también en el iframe
  window.onload = function() {
    var iframe = document.getElementById('content-iframe');
    if (iframe) {
      iframe.onload = function() {
        try {
          iframe.contentWindow.document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
          });
          
          iframe.contentWindow.document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
              e.preventDefault();
            }
          });
        } catch(e) {
          console.log('No se pueden aplicar restricciones al iframe debido a la política del mismo origen');
        }
      };
    }
  };