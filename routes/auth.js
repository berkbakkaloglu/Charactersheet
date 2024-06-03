const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Dosya adı küçük harfle

const router = express.Router();

// Giriş Sayfası
router.get('/login', (req, res) => {
    res.render('login');
});

// Kayıt Sayfası
router.get('/register', (req, res) => {
    res.render('register');
});

// Kayıt
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = new User({ username, password, role });
        await user.save();
        res.status(201).send('Kullanıcı oluşturuldu');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Giriş
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Geçersiz kullanıcı adı veya şifre');
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret');
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
