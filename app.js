require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const { authMiddleware, adminMiddleware, userMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth'); 
const Character = require('./models/Character');
const News = require('./models/News');

const app = express();

// MongoDB bağlantısını kontrol et
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth Routes
app.use('/auth', authRoutes);

// Haberleri alın ve ana sayfayı render edin
app.get('/', authMiddleware, async (req, res) => {
  try {
    const news = await News.find();
    res.render('index', { news: news, user: req.user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Haber Ekleme
app.post('/api/news', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        console.log("Haber ekleme isteği alındı.");
        console.log("Başlık:", req.body.title);
        console.log("İçerik:", req.body.content);
        console.log("Dosya:", req.file);

        if (!req.file) {
            throw new Error("Dosya yükleme hatası.");
        }

        const news = new News({
            title: req.body.title,
            content: req.body.content,
            image: `/uploads/${req.file.filename}`
        });

        await news.save();
        console.log("Haber başarıyla kaydedildi.");
        res.redirect('/');
    } catch (error) {
        console.error("Haber eklenirken hata oluştu:", error.message);
        res.status(500).send({ error: error.message });
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
  try {
    const characters = await Character.find();
    res.render('characters', { characters: characters });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Karakter detayları sayfası (Kullanıcı ve admin)
app.get('/characters/:id', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    const user = req.user;
    res.render('character-details', { character: character, user: user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Avatar Yükleme
app.post('/api/characters/:id/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Karakter bulunamadı');
    }

    character.avatar = `/uploads/${req.file.filename}`;
    await character.save();

    res.redirect(`/characters/${character._id}`);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});