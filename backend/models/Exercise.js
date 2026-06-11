const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  equipment: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, required: true }
});

module.exports = mongoose.model('Exercise', exerciseSchema);