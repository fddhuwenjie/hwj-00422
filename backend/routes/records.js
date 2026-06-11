const express = require('express');
const router = express.Router();
const TrainingRecord = require('../models/TrainingRecord');

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    const records = await TrainingRecord.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await TrainingRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    let totalVolume = 0;
    req.body.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
      });
    });
    req.body.totalVolume = totalVolume;
    
    const record = new TrainingRecord(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    let totalVolume = 0;
    req.body.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
      });
    });
    req.body.totalVolume = totalVolume;
    
    const updatedRecord = await TrainingRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await TrainingRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;