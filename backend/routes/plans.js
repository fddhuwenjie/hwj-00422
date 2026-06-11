const express = require('express');
const router = express.Router();
const TrainingPlan = require('../models/TrainingPlan');

router.get('/', async (req, res) => {
  try {
    const plans = await TrainingPlan.find().populate('days.exercises.exerciseId');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plan = await TrainingPlan.findById(req.params.id).populate('days.exercises.exerciseId');
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const plan = new TrainingPlan(req.body);
    const savedPlan = await plan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedPlan = await TrainingPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('days.exercises.exerciseId');
    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await TrainingPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;