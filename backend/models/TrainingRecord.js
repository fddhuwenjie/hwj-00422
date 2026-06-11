const mongoose = require('mongoose');

const performedSetSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  reps: { type: Number, required: true }
});

const exerciseRecordSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  exerciseName: { type: String },
  sets: [performedSetSchema]
});

const trainingRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingPlan' },
  exercises: [exerciseRecordSchema],
  totalDuration: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  notes: { type: String }
});

module.exports = mongoose.model('TrainingRecord', trainingRecordSchema);