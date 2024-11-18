const pool = require("../config/database")
const require2FA = async (req, res, next) => {
    if (!req.user) {
      return res.redirect('/');
    }
  
    const [users] = await pool.query(
      'SELECT two_factor_enabled FROM usuarios WHERE id = ?',
      [req.user.id]
    );
  
    // Comparar con '1' para true
    if (users[0].two_factor_enabled === 1 && !req.session.twoFactorVerified) {
      return res.redirect('/2fa-verify');
    }
  
    next();
  };
  
  module.exports = require2FA;