// middleware/isadmin.js
function isAdmin(req, res, next) {
    // Verificar si el usuario está autenticado y es admin
    // Usando == para comparación flexible con 1 o true
    if (req.isAuthenticated() && req.user && (req.user.admin == true || req.user.admin == 1)) {
        return next();
    }
    
    res.redirect('/acceso_denegado');
}

module.exports = isAdmin;