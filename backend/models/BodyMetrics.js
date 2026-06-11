const mongoose = require('mongoose');

const bodyMetricsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  weight: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  arms: { type: Number },
  legs: { type: Number }
});

module.exports = mongoose.model('BodyMetrics', bodyMetricsSchema);