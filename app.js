const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));


// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Rutas
app.get('/', (req, res) => {
  res.render('login', { user: req.user });
});

app.get('/acceso_denegado', (req, res) => {
  res.render('acceso_denegado');
});

app.get('/alta', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user, iframe:req.user.iframe_alta });
});

app.get('/baja', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user, iframe:req.user.iframe_baja });
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