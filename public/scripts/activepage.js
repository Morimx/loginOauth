      // Marcar la página actual como activa
      document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-link');
        
        links.forEach(link => {
          if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
          }
        });
      });