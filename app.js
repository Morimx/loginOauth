const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const path = require('path');
const iframeProxyMiddleware = require('./middleware/security');
const isAuthenticated = require('./middleware/autentication');
const isAdmin = require('./middleware/isadmin');
const flash = require('express-flash');
const pool = require('./config/database');
const hasBaja = require("./middleware/bajamw")
const hasAlta = require("./middleware/altamw")
const require2FA = require("./middleware/2mfamw")
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


app.get('/2fa-setup', isAuthenticated, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `YourApp:${req.user.username}`
  });
  
  // Store the secret temporarily in session
  req.session.tempSecret = secret.base32;
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  res.render('2fa-setup', {
    qrCodeUrl,
    secret: secret.base32,
    user: req.user
  });
});

app.post('/2fa-enable', isAuthenticated, async (req, res) => {
  const { token } = req.body;
  const secret = req.session.tempSecret;

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token
  });

  if (verified) {
    try {
      // Actualizar usuario con 2FA habilitado usando 1 para true
      await pool.query(
        'UPDATE usuarios SET two_factor_secret = ?, two_factor_enabled = 1 WHERE id = ?',
        [secret, req.user.id]
      );

      // Log usando el formato existente
      await pool.query(
        'INSERT INTO user_logs (action_type, user_id, action_details) VALUES (?, ?, ?)',
        ['1', req.user.id, 'Activación de autenticación de dos factores']
      );

      req.session.twoFactorVerified = true;
      res.json({ success: true });
    } catch (error) {
      console.error('Error al activar 2FA:', error);
      res.json({ success: false, message: 'Error al activar 2FA' });
    }
  } else {
    res.json({ success: false, message: 'Código inválido' });
  }
});

app.get('/2fa-verify', isAuthenticated, (req, res) => {
  res.render('2fa-verify', { user: req.user });
});

app.post('/2fa-verify', isAuthenticated, async (req, res) => {
  const { token } = req.body;
  
  try {
    const [users] = await pool.query(
      'SELECT two_factor_secret FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    const verified = speakeasy.totp.verify({
      secret: users[0].two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      // Log de verificación exitosa
      await pool.query(
        'INSERT INTO user_logs (action_type, user_id, action_details) VALUES (?, ?, ?)',
        ['1', req.user.id, 'Verificación 2FA exitosa']
      );

      req.session.twoFactorVerified = true;
      res.json({ success: true });
    } else {
      // Log de verificación fallida
      await pool.query(
        'INSERT INTO user_logs (action_type, user_id, action_details) VALUES (?, ?, ?)',
        ['0', req.user.id, 'Verificación 2FA fallida']
      );

      res.json({ success: false, message: 'Código inválido' });
    }
  } catch (error) {
    console.error('Error en verificación 2FA:', error);
    res.json({ success: false, message: 'Error en la verificación' });
  }
});

// Rutas
app.get('/', (req, res) => {
  res.render('login', { user: req.user });
});

// En app.js, actualiza la ruta de index:
app.get('/index', isAuthenticated, require2FA, (req, res) => {
  res.render('index', { 
    user: req.user, 
    currentPage: 'index' 
  });
});

app.get('/acceso_denegado', (req, res) => {
  res.render('acceso_denegado');
});

app.get('/alta', isAuthenticated, require2FA, hasAlta, (req, res) => {
  res.render('dashboard', { user: req.user, iframe:req.user.iframe_alta, currentPage: 'alta' });
});

app.get('/baja', isAuthenticated, require2FA, hasBaja, (req, res) => {
  res.render('dashboard', { user: req.user, iframe:req.user.iframe_baja, currentPage: 'baja' });
});

app.get('/phishing', isAuthenticated, (req, res) => {
  res.redirect('https://www.youtube.com/embed/msAeHCoCdpc?si=yfchBpi89LUjkom4?&autoplay=1');
});

// Nueva ruta para cargar usuarios
app.get('/admin', isAuthenticated, require2FA, isAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    res.render('admin', { user: req.user, usuarios, currentPage: 'admin' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar usuarios');
  }
});

// En app.js, modificar la ruta /admin/update-permissions
app.post('/admin/update-permissions', isAuthenticated, require2FA, isAdmin, async (req, res) => {
  try {
      const [usuarios] = await pool.query('SELECT id FROM usuarios');
      
      // Mapea los usuarios para verificar cada checkbox y registrar cambios
      const updates = usuarios.map(async (usuario) => {
          const id = usuario.id;
          const altas = req.body[`alta_${id}`] === 'on' ? 1 : 0;
          const bajas = req.body[`baja_${id}`] === 'on' ? 1 : 0;
          const isAdmin = req.body[`admin_${id}`] === 'on' ? 1 : 0;


          // Obtener valores actuales para comparar
          const [currentValues] = await pool.query(
              'SELECT bajas, is_admin, altas FROM usuarios WHERE id = ?',
              [id]
          );

          const current = currentValues[0];
          
          // Si hay cambios, actualizar y registrar
          if (current.bajas !== bajas || current.is_admin !== isAdmin || current.altas !== altas) {
              // Actualizar permisos
              await pool.query(
                  'UPDATE usuarios SET bajas = ?, is_admin = ?, altas = ? WHERE id = ?',
                  [bajas, isAdmin, altas, id]
              );

              // Registrar el cambio en los logs
              const changes = [];
              if (current.bajas !== bajas) {
                  changes.push(`bajas: ${current.bajas} -> ${bajas}`);
              }
              if (current.altas !== altas) {
                changes.push(`altas: ${current.altas} -> ${altas}`);
            }
              if (current.is_admin !== isAdmin) {
                  changes.push(`is_admin: ${current.is_admin} -> ${isAdmin}`);
              }

              await pool.query(
                  'INSERT INTO user_logs (action_type, user_id, target_user_id, action_details) VALUES (?, ?, ?, ?)',
                  ['permission_change', req.user.id, id, `Changed permissions: ${changes.join(', ')}`]
              );
          }
      });

      await Promise.all(updates);
      req.flash('success', 'Usuarios actualizados correctamente');
      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      req.flash('error', 'Error al actualizar permisos');
      res.status(500).send('Error al actualizar permisos');
  }
});

app.get('/admin/logs', isAuthenticated, require2FA, isAdmin, async (req, res) => {
  try {
      const [logs] = await pool.query(`
          SELECT 
              ul.*,
              u1.username as actor_username,
              u2.username as target_username
          FROM user_logs ul
          LEFT JOIN usuarios u1 ON ul.user_id = u1.id
          LEFT JOIN usuarios u2 ON ul.target_user_id = u2.id
          ORDER BY created_at DESC
          LIMIT 100
      `);
      
      res.render('logs', { user: req.user, logs, currentPage: 'logs' });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error al cargar logs');
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
    res.redirect('/index');
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
    res.redirect('/index');
  }
);


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});