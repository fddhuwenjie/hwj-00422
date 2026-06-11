const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const exercisesData = require('../data/exercises');

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.muscleGroup) {
      query.muscleGroup = req.query.muscleGroup;
    }
    if (req.query.equipment) {
      query.equipment = req.query.equipment;
    }
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    const exercises = await Exercise.find(query);
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const exercise = new Exercise(req.body);
    const savedExercise = await exercise.save();
    res.status(201).json(savedExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedExercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exercise deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    await Exercise.deleteMany({});
    const exercises = await Exercise.insertMany(exercisesData);
    res.json({ message: 'Exercises seeded', count: exercises.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;