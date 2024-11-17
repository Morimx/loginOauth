// middleware/hasBaja.js
function hasBaja(req, res, next) {
    if (req.isAuthenticated() && req.user && (req.user.bajas == true || req.user.bajas == 1)) {
        return next();
    }
    
    res.redirect('/acceso_denegado');
}

module.exports = hasBaja;