require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const { authMiddleware, adminMiddleware, userMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth'); 
const Character = require('./models/Character');
const News = require('./models/News');

const app = express();

// Firebase yapılandırması
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

const multerMiddleware = multer({
  storage: multer.memoryStorage(),
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth Routes
app.use('/auth', authRoutes);

// Haberleri alın ve ana sayfayı render edin
app.get('/', authMiddleware, async (req, res) => {
  const news = await News.find();
  res.render('index', { news: news, user: req.user });
});

// Haber Ekleme
app.post('/api/news', authMiddleware, adminMiddleware, multerMiddleware.single('image'), async (req, res) => {
  try {
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', err => {
      res.status(500).send({ message: err.message });
    });

    blobStream.on('finish', async () => {
      const news = new News({
        title: req.body.title,
        content: req.body.content,
        image: `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${req.file.originalname}`
      });
      await news.save();
      res.redirect('/');
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Haber Silme
app.delete('/api/news/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Haber başarıyla silindi.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Karakter oluşturma sayfası (Kullanıcı ve admin)
app.get('/create-character', authMiddleware, (req, res) => {
  const user = req.user;
  res.render('create-character', { user: user });
});

// Yeni karakter oluşturma (Kullanıcı ve admin)
app.post('/characters', authMiddleware, async (req, res) => {
  try {
    const { name, height, weight, gender, race, class: charClass, strength, dexterity, constitution, intelligence, wisdom, charisma, inventory, spells, biography } = req.body;

    const character = new Character({
      name,
      height,
      weight,
      gender,
      race,
      class: charClass,
      stats: {
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma
      },
      inventory: inventory ? inventory.split(',') : [],
      spells: spells ? spells.split(',') : [],
      biography
    });

    await character.save();
    res.redirect('/characters');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Tüm karakterleri listeleme (Kullanıcı ve admin)
app.get('/characters', authMiddleware, userMiddleware, async (req, res) => {
  const characters = await Character.find();
  res.render('characters', { characters: characters });
});

// Karakter detayları sayfası (Kullanıcı ve admin)
app.get('/characters/:id', authMiddleware, async (req, res) => {
  const character = await Character.findById(req.params.id);
  const user = req.user; // Oturum açmış kullanıcıyı al
  res.render('character-details', { character: character, user: user });
});

// Avatar Yükleme
app.post('/api/characters/:id/avatar', authMiddleware, multerMiddleware.single('avatar'), async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', err => {
      res.status(500).send({ message: err.message });
    });

    blobStream.on('finish', async () => {
      character.avatar = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${req.file.originalname}`;
      await character.save();
      res.redirect(`/characters/${character._id}`);
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Stat Güncelleme
app.patch('/api/characters/:id/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    for (const [stat, value] of Object.entries(req.body)) {
      character.stats[stat] = value;
    }

    await character.save();
    res.send(character);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Envanter Güncelleme
app.patch('/api/characters/:id/inventory', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    character.inventory = req.body.inventory;
    await character.save();
    res.send(character);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Büyü Güncelleme
app.patch('/api/characters/:id/spells', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    character.spells = req.body.spells;
    await character.save();
    res.send(character);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Durum Güncelleme
app.patch('/api/characters/:id/conditions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    character.conditions = req.body.conditions;
    await character.save();
    res.send(character);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Özgeçmiş Güncelleme
app.patch('/api/characters/:id/biography', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    character.biography = req.body.biography;
    await character.save();
    res.send(character);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => {
  console.log('Sunucu çalışıyor: http://localhost:3000');
});
// app test