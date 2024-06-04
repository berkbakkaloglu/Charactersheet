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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);

// News Routes
app.post('/api/news', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const news = new News({
            title: req.body.title,
            content: req.body.content,
            image: `/uploads/${req.file.filename}`
        });
        await news.save();
        res.redirect('/');
    } catch (error) {
        console.error('News POST error:', error);
        res.status(500).send(error.message);
    }
});

app.delete('/api/news/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Haber başarıyla silindi.' });
    } catch (error) {
        console.error('News DELETE error:', error);
        res.status(500).send({ message: error.message });
    }
});

// Character Routes
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
        console.error('Avatar POST error:', error);
        res.status(500).send(error.message);
    }
});

// Other Character Routes
app.get('/', authMiddleware, async (req, res) => {
    try {
        const news = await News.find();
        res.render('index', { news: news, user: req.user });
    } catch (error) {
        console.error('GET / error:', error);
        res.status(500).send(error.message);
    }
});

app.get('/create-character', authMiddleware, (req, res) => {
    res.render('create-character', { user: req.user });
});

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
            stats: { strength, dexterity, constitution, intelligence, wisdom, charisma },
            inventory: inventory ? inventory.split(',') : [],
            spells: spells ? spells.split(',') : [],
            biography
        });
        await character.save();
        res.redirect('/characters');
    } catch (error) {
        console.error('Character POST error:', error);
        res.status(500).send(error.message);
    }
});

app.get('/characters', authMiddleware, userMiddleware, async (req, res) => {
    try {
        const characters = await Character.find();
        res.render('characters', { characters: characters });
    } catch (error) {
        console.error('GET /characters error:', error);
        res.status(500).send(error.message);
    }
});

app.get('/characters/:id', authMiddleware, async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        res.render('character-details', { character: character, user: req.user });
    } catch (error) {
        console.error('GET /characters/:id error:', error);
        res.status(500).send(error.message);
    }
});

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
        console.error('Stats PATCH error:', error);
        res.status(500).send(error.message);
    }
});

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
        console.error('Inventory PATCH error:', error);
        res.status(500).send(error.message);
    }
});

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
        console.error('Spells PATCH error:', error);
        res.status(500).send(error.message);
    }
});

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
        console.error('Conditions PATCH error:', error);
        res.status(500).send(error.message);
    }
});

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
        console.error('Biography PATCH error:', error);
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log('Sunucu çalışıyor: http://localhost:3000');
});
