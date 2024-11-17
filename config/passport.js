// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const pool = require('./database');
require('dotenv').config();

passport.serializeUser((id, done) => {
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    let user = users[0]
    let domain = user.username.split('@').pop()
    const [iframes] = await pool.query('SELECT * FROM iframes WHERE domain = ?', [domain]);

    const iframe_alta = `/proxy-iframe?url=${encodeURIComponent(iframes[0].iframe_alta)}`;
    const iframe_baja = `/proxy-iframe?url=${encodeURIComponent(iframes[0].iframe_baja)}`;
    const isAdmin = user.is_admin == 1;
    
    done(null, {
      id: id,
      username: user.username,
      display_name: user.display_name,
      full_access: user.full_access,
      iframe_alta: iframe_alta,
      iframe_baja: iframe_baja,
      admin: user.is_admin
    });

  } catch (error) {
    done(error, null);
  }
});

async function handleAuth(profile, provider, done) {

    let email;
    let domain;
    let id;

    // Check & extract email
    email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;  
    if (!email) {
      return done('Email no disponible', false);
    }

    // Check if domain valid
    domain = email.split('@').pop();
    let [resIframes] = await pool.query(
      `SELECT * FROM iframes WHERE domain = ?`,
      [domain]
    );

    if(resIframes.length == 0){
      return done(null, false, { message: 'Dominio sin reconocer' });
    }
    
    // Check if user exists
    let [resUsuarios] = await pool.query(
      `SELECT * FROM usuarios WHERE platform_id = ?`,
      [profile.id]
    );

    if(resUsuarios.length == 0){

      try{
        let [res] = await pool.query(
          `INSERT INTO usuarios (username, platform_id, full_access, display_name) VALUES (?, ?, ?, ?)`,
          [
            email,
            profile.id,
            false,
            profile.displayName
          ]
        );
        id = res.insertId
      } catch(err){
        console.log(err);
      }
    } else {
      id = resUsuarios[0].id
    }
    // Registrar el log de inicio de sesión
    try {
      await pool.query(
          'INSERT INTO user_logs (action_type, user_id, action_details) VALUES (?, ?, ?)',
          ['login', id, `Login successful via ${provider}`]
      );
  } catch (err) {
      console.error('Error logging login:', err);
      // No interrumpimos el login si falla el log
  }
    return done(null, id);

  }


// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    handleAuth(profile, 'google', done);
  }
));

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/microsoft/callback",
    scope: ['openid', 'user.read', 'profile', 'email', 'offline_access'],
    // Cambia 'common' por el tenant ID o dominio de tu organización
    tenant: '063076a8-ffd2-49e3-ba8d-45bc00bb1bd6',
    authorizationURL: process.env.MICROSOFT_AUTH_URL,
    tokenURL: process.env.MICROSOFT_TOKEN_URL
  },
  (accessToken, refreshToken, profile, done) => {
    handleAuth(profile, 'microsoft', done);
  }
));

module.exports = passport;