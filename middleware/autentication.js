// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };
  
  module.exports = isAuthenticated;