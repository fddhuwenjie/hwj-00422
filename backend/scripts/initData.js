const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');
const TrainingRecord = require('../models/TrainingRecord');
const BodyMetrics = require('../models/BodyMetrics');
const exercisesData = require('../data/exercises');

const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];

const exerciseNamesByMuscle = {
  '胸': ['杠铃卧推', '哑铃卧推', '胸肌飞鸟', '双杠臂屈伸', '俯卧撑'],
  '背': ['引体向上', '高位下拉', '杠铃划船', '哑铃划船', '坐姿划船'],
  '肩': ['杠铃推举', '哑铃推举', '侧平举', '前平举', '俯身飞鸟'],
  '臂': ['杠铃弯举', '哑铃弯举', '绳索下压', '三头肌推举', '锤式弯举'],
  '腿': ['杠铃深蹲', '腿举', '腿弯举', '腿伸展', '罗马尼亚硬拉'],
  '核心': ['平板支撑', '卷腹', '仰卧起坐', '俄罗斯转体', '登山者']
};

function generateTrainingRecord(date, muscleGroup) {
  const exercises = [];
  const exerciseNames = exerciseNamesByMuscle[muscleGroup];
  const numExercises = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < numExercises; i++) {
    const exerciseName = exerciseNames[Math.floor(Math.random() * exerciseNames.length)];
    const sets = Math.floor(Math.random() * 2) + 3;
    const reps = Math.floor(Math.random() * 5) + 8;
    const weight = Math.floor(Math.random() * 40) + 20;
    
    const performedSets = [];
    for (let j = 0; j < sets; j++) {
      performedSets.push({
        weight: weight + Math.floor(Math.random() * 10) - 5,
        reps: reps + Math.floor(Math.random() * 4) - 2
      });
    }
    
    exercises.push({
      exerciseName,
      sets: performedSets
    });
  }
  
  let totalVolume = 0;
  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      totalVolume += set.weight * set.reps;
    });
  });
  
  return {
    date,
    exercises,
    totalDuration: Math.floor(Math.random() * 30) + 45,
    totalVolume
  };
}

async function initData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fitness_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await Exercise.deleteMany({});
    await TrainingRecord.deleteMany({});
    await BodyMetrics.deleteMany({});

    const exercises = await Exercise.insertMany(exercisesData);
    console.log(`Inserted ${exercises.length} exercises`);

    const records = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (Math.random() > 0.3) {
        const muscleGroup = muscleGroups[Math.floor(Math.random() * muscleGroups.length)];
        const record = generateTrainingRecord(date, muscleGroup);
        records.push(record);
      }
    }
    
    await TrainingRecord.insertMany(records);
    console.log(`Inserted ${records.length} training records`);

    const bodyMetrics = [];
    let weight = 70;
    for (let i = 29; i >= 0; i -= 7) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      weight += (Math.random() - 0.5) * 0.5;
      bodyMetrics.push({
        date,
        weight: Math.round(weight * 10) / 10,
        chest: Math.round((100 + Math.random() * 10) * 10) / 10,
        waist: Math.round((80 + Math.random() * 10) * 10) / 10,
        arms: Math.round((30 + Math.random() * 5) * 10) / 10,
        legs: Math.round((50 + Math.random() * 10) * 10) / 10
      });
    }
    
    await BodyMetrics.insertMany(bodyMetrics);
    console.log(`Inserted ${bodyMetrics.length} body metrics records`);

    console.log('Data initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
}

initData();