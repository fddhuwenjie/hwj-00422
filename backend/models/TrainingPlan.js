const mongoose = require('mongoose');

const exerciseSetSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, default: 0 }
});

const dayPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  name: { type: String },
  muscleGroup: { type: String },
  exercises: [exerciseSetSchema]
});

const trainingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['bulk', 'cut', 'strength', 'maintain'] },
  days: [dayPlanSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingPlan', trainingPlanSchema);