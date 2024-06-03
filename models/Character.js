const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    gender: { type: String, required: true },
    race: { type: String, required: true },
    class: { type: String, required: true },
    stats: {
        strength: { type: Number, required: true },
        dexterity: { type: Number, required: true },
        constitution: { type: Number, required: true },
        intelligence: { type: Number, required: true },
        wisdom: { type: Number, required: true },
        charisma: { type: Number, required: true }
    },
    biography: { type: String, required: true },
    inventory: [String],
    spells: [String],
    conditions: [String],
    avatar: { type: String }
});

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;
