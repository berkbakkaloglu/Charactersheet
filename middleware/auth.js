const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Dosya adı küçük harfle

function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/auth/login');
    }

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.redirect('/auth/login');
        }
        req.user = decoded;
        next();
    });
}

function adminMiddleware(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Bu işlem için yetkiniz yok.');
    }
    next();
}

function userMiddleware(req, res, next) {
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).send('Bu işlem için yetkiniz yok.');
    }
    next();
}

module.exports = { authMiddleware, adminMiddleware, userMiddleware };
