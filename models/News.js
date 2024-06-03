const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
