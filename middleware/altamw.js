// middleware/hasAlta.js
function hasAlta(req, res, next) {
    if (req.isAuthenticated() && req.user && (req.user.altas == true || req.user.altas == 1)) {
        return next();
    }
    
    res.redirect('/acceso_denegado');
}

module.exports = hasAlta;