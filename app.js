const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const path = require('path');
const iframeProxyMiddleware = require('./middleware/security');
const isAuthenticated = require('./middleware/autentication');
const isAdmin = require('./middleware/isadmin');
const flash = require('express-flash');
const pool = require('./config/database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(flash())
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
app.use(iframeProxyMiddleware);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());



// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Rutas
app.get('/', (req, res) => {
  res.render('login', { user: req.user });
});

app.get('/acceso_denegado', (req, res) => {
  res.render('acceso_denegado');
});

app.get('/alta', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user, iframe:req.user.iframe_alta, currentPage: 'alta' });
});

app.get('/baja', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user, iframe:req.user.iframe_baja, currentPage: 'baja' });
});

app.get('/phishing', isAuthenticated, (req, res) => {
  res.redirect('https://www.youtube.com/embed/msAeHCoCdpc?si=yfchBpi89LUjkom4?&autoplay=1');
});

// Nueva ruta para cargar usuarios
app.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    res.render('admin', { user: req.user, usuarios, currentPage: 'admin' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar usuarios');
  }
});

// Nueva ruta para actualizar permisos
app.post('/admin/update-permissions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Obtén todos los usuarios de la base de datos para verificar los IDs existentes
    const [usuarios] = await pool.query('SELECT id FROM usuarios');

    // Mapea los usuarios para verificar cada checkbox
    const updates = usuarios.map(async (usuario) => {
      const id = usuario.id;

      // Verifica si el checkbox estaba marcado en la solicitud
      const fullAccess = req.body[`baja_${id}`] === 'on' ? 1 : 0;
      const isAdmin = req.body[`admin_${id}`] === 'on' ? 1 : 0;

      // Actualiza los valores en la base de datos
      await pool.query('UPDATE usuarios SET full_access = ?, is_admin = ? WHERE id = ?', [
        fullAccess,
        isAdmin,
        id,
      ]);
    });

    await Promise.all(updates); // Espera a que todas las actualizaciones terminen
    req.flash('success', 'Usuarios actualizados correctamente');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error al actualizar permisos');
    res.status(500).send('Error al actualizar permisos');
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Rutas de autenticación de Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback
app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/acceso_denegado',
    failureMessage: true
  }),
  (req, res) => {
    res.redirect('/alta');
  }
);
// Rutas de Microsoft en app.js
app.get('/auth/microsoft',
  passport.authenticate('microsoft', {
    // Definir todos los scopes necesarios
    scope: ['openid', 'user.read', 'profile', 'email', 'offline_access'],
    prompt: 'select_account'
  })
);
  
// Microsoft callback
app.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', {
    failureRedirect: '/acceso_denegado',
    failureMessage: true
  }),
  (req, res) => {
    res.redirect('/alta');
  }
);


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});