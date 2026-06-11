const express = require('express');
const router = express.Router();
const TrainingRecord = require('../models/TrainingRecord');
const BodyMetrics = require('../models/BodyMetrics');
const Exercise = require('../models/Exercise');

router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklyRecords = await TrainingRecord.find({
      date: { $gte: weekStart, $lt: weekEnd }
    });

    const totalDays = weeklyRecords.length;
    const totalDuration = weeklyRecords.reduce((sum, r) => sum + (r.totalDuration || 0), 0);
    const totalVolume = weeklyRecords.reduce((sum, r) => sum + (r.totalVolume || 0), 0);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentRecords = await TrainingRecord.find({ date: { $gte: last30Days } });

    const calendarData = {};
    recentRecords.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      calendarData[dateStr] = (calendarData[dateStr] || 0) + 1;
    });

    res.json({
      weeklyTrainingDays: totalDays,
      weeklyTotalDuration: totalDuration,
      weeklyTotalVolume: totalVolume,
      calendarData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/one-rep-max/:exerciseId', async (req, res) => {
  try {
    const records = await TrainingRecord.find({
      'exercises.exerciseId': req.params.exerciseId
    }).sort({ date: 1 });

    const oneRepMaxData = records.map(record => {
      const exercise = record.exercises.find(e => e.exerciseId.toString() === req.params.exerciseId);
      if (!exercise || exercise.sets.length === 0) return null;
      
      const bestSet = exercise.sets.reduce((best, set) => {
        const estimate = set.weight * (1 + set.reps / 30);
        return estimate > (best.estimate || 0) ? { weight: set.weight, reps: set.reps, estimate, date: record.date } : best;
      }, { estimate: 0 });
      
      return {
        date: record.date,
        oneRepMax: Math.round(bestSet.estimate)
      };
    }).filter(Boolean);

    res.json(oneRepMaxData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/weekly-volume', async (req, res) => {
  try {
    const records = await TrainingRecord.find().sort({ date: 1 });
    
    const weeklyData = {};
    records.forEach(record => {
      const weekKey = record.date.toISOString().split('T')[0].slice(0, 7) + '-' + Math.ceil(record.date.getDate() / 7);
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (record.totalVolume || 0);
    });

    const result = Object.entries(weeklyData).map(([week, volume]) => ({
      week,
      volume
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/body-metrics', async (req, res) => {
  try {
    const metrics = await BodyMetrics.find().sort({ date: 1 });
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/body-metrics', async (req, res) => {
  try {
    const metrics = new BodyMetrics(req.body);
    const savedMetrics = await metrics.save();
    res.status(201).json(savedMetrics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/personal-records', async (req, res) => {
  try {
    const records = await TrainingRecord.find();
    
    const prs = {};
    records.forEach(record => {
      record.exercises.forEach(exercise => {
        const exerciseId = exercise.exerciseId?.toString() || exercise.exerciseName;
        exercise.sets.forEach(set => {
          const estimate = set.weight * (1 + set.reps / 30);
          if (!prs[exerciseId] || estimate > prs[exerciseId].estimate) {
            prs[exerciseId] = {
              exerciseId,
              exerciseName: exercise.exerciseName,
              weight: set.weight,
              reps: set.reps,
              oneRepMax: Math.round(estimate),
              date: record.date
            };
          }
        });
      });
    });

    const exercises = await Exercise.find();
    const result = Object.values(prs).map(pr => {
      const exercise = exercises.find(e => e._id.toString() === pr.exerciseId);
      return {
        ...pr,
        muscleGroup: exercise?.muscleGroup || 'Unknown'
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/muscle-group-distribution', async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const records = await TrainingRecord.find({
      date: { $gte: weekStart, $lt: weekEnd }
    });

    const exercises = await Exercise.find();
    const exerciseMap = new Map(exercises.map(e => [e._id.toString(), e]));

    const distribution = {};
    records.forEach(record => {
      record.exercises.forEach(exercise => {
        const exerciseDoc = exerciseMap.get(exercise.exerciseId?.toString());
        const muscleGroup = exerciseDoc?.muscleGroup || 'Unknown';
        const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        distribution[muscleGroup] = (distribution[muscleGroup] || 0) + volume;
      });
    });

    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;