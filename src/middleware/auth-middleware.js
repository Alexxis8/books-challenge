function authMiddleware(req, res, next) {
    if (req.cookies.usuario != undefined) {
      req.session.usuario = req.cookies.usuario;
    }
  
    res.locals.session = req.session.usuario;
    next();
  }
  
  module.exports = authMiddleware;