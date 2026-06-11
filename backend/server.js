const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8422;

app.use(cors());
app.use(bodyParser.json());

const exercisesData = require('./data/exercises');

let exercises = [...exercisesData];
let plans = [];
let records = [];
let bodyMetrics = [];
let users = [{ _id: 1, name: '默认用户', inviteCode: '123456' }];
let friends = [];
let challenges = [];

let exerciseIdCounter = exercisesData.length + 1;
let planIdCounter = 1;
let recordIdCounter = 1;
let metricsIdCounter = 1;
let userIdCounter = 2;
let challengeIdCounter = 1;

function generateTrainingRecord(date, muscleGroup) {
  const exerciseNamesByMuscle = {
    '胸': ['杠铃卧推', '哑铃卧推', '胸肌飞鸟', '双杠臂屈伸', '俯卧撑'],
    '背': ['引体向上', '高位下拉', '杠铃划船', '哑铃划船', '坐姿划船'],
    '肩': ['杠铃推举', '哑铃推举', '侧平举', '前平举', '俯身飞鸟'],
    '臂': ['杠铃弯举', '哑铃弯举', '绳索下压', '三头肌推举', '锤式弯举'],
    '腿': ['杠铃深蹲', '腿举', '腿弯举', '腿伸展', '罗马尼亚硬拉'],
    '核心': ['平板支撑', '卷腹', '仰卧起坐', '俄罗斯转体', '登山者']
  };
  
  const exerciseNames = exerciseNamesByMuscle[muscleGroup];
  const numExercises = Math.floor(Math.random() * 3) + 3;
  const exercises = [];
  
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
    _id: recordIdCounter++,
    date,
    exercises,
    totalDuration: Math.floor(Math.random() * 30) + 45,
    totalVolume
  };
}

const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];
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

let weight = 70;
for (let i = 29; i >= 0; i -= 7) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  weight += (Math.random() - 0.5) * 0.5;
  bodyMetrics.push({
    _id: metricsIdCounter++,
    date,
    weight: Math.round(weight * 10) / 10,
    chest: Math.round((100 + Math.random() * 10) * 10) / 10,
    waist: Math.round((80 + Math.random() * 10) * 10) / 10,
    arms: Math.round((30 + Math.random() * 5) * 10) / 10,
    legs: Math.round((50 + Math.random() * 10) * 10) / 10
  });
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.get('/api/exercises', (req, res) => {
  let result = [...exercises];
  if (req.query.muscleGroup) {
    result = result.filter(e => e.muscleGroup === req.query.muscleGroup);
  }
  if (req.query.equipment) {
    result = result.filter(e => e.equipment === req.query.equipment);
  }
  if (req.query.search) {
    result = result.filter(e => e.name.toLowerCase().includes(req.query.search.toLowerCase()));
  }
  res.json(result);
});

app.get('/api/exercises/:id', (req, res) => {
  const exercise = exercises.find(e => e._id == req.params.id);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  res.json(exercise);
});

app.post('/api/exercises', (req, res) => {
  const exercise = { ...req.body, _id: exerciseIdCounter++ };
  exercises.push(exercise);
  res.status(201).json(exercise);
});

app.put('/api/exercises/:id', (req, res) => {
  const index = exercises.findIndex(e => e._id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  exercises[index] = { ...exercises[index], ...req.body };
  res.json(exercises[index]);
});

app.delete('/api/exercises/:id', (req, res) => {
  const index = exercises.findIndex(e => e._id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  exercises.splice(index, 1);
  res.json({ message: 'Exercise deleted' });
});

app.get('/api/plans', (req, res) => {
  res.json(plans);
});

app.get('/api/plans/:id', (req, res) => {
  const plan = plans.find(p => p._id == req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  res.json(plan);
});

app.post('/api/plans', (req, res) => {
  const plan = { ...req.body, _id: planIdCounter++ };
  plans.push(plan);
  res.status(201).json(plan);
});

app.put('/api/plans/:id', (req, res) => {
  const index = plans.findIndex(p => p._id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  plans[index] = { ...plans[index], ...req.body };
  res.json(plans[index]);
});

app.delete('/api/plans/:id', (req, res) => {
  const index = plans.findIndex(p => p._id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  plans.splice(index, 1);
  res.json({ message: 'Plan deleted' });
});

app.get('/api/records', (req, res) => {
  let result = [...records];
  if (req.query.startDate && req.query.endDate) {
    result = result.filter(r => {
      const date = new Date(r.date);
      return date >= new Date(req.query.startDate) && date <= new Date(req.query.endDate);
    });
  }
  res.json(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.get('/api/records/:id', (req, res) => {
  const record = records.find(r => r._id == req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.json(record);
});

app.post('/api/records', (req, res) => {
  let totalVolume = 0;
  req.body.exercises.forEach(exercise => {
    if (exercise.type === 'superset') {
      exercise.exercises.forEach(subEx => {
        subEx.sets.forEach(set => {
          totalVolume += set.weight * set.reps;
        });
      });
    } else if (exercise.type === 'dropSet') {
      exercise.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
      });
    } else {
      exercise.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
      });
    }
  });
  
  const record = {
    ...req.body,
    _id: recordIdCounter++,
    totalVolume
  };
  records.push(record);
  res.status(201).json(record);
});

app.put('/api/records/:id', (req, res) => {
  const index = records.findIndex(r => r._id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  
  let totalVolume = 0;
  req.body.exercises.forEach(exercise => {
    if (exercise.type === 'superset') {
      exercise.exercises.forEach(subEx => {
        subEx.sets.forEach(set => {
          totalVolume += set.weight * set.reps;
        });
      });
    } else if (exercise.type === 'dropSet') {
      exercise.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
      });
    } else {
      exercise.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
      });
    }
  });
  
  records[index] = { ...records[index], ...req.body, totalVolume };
  res.json(records[index]);
});

app.delete('/api/records/:id', (req, res) => {
  const index = records.findIndex(r => r._id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  records.splice(index, 1);
  res.json({ message: 'Record deleted' });
});

app.get('/api/analysis/dashboard', (req, res) => {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weeklyRecords = records.filter(r => {
    const date = new Date(r.date);
    return date >= weekStart && date < weekEnd;
  });

  const totalDays = weeklyRecords.length;
  const totalDuration = weeklyRecords.reduce((sum, r) => sum + (r.totalDuration || 0), 0);
  const totalVolume = weeklyRecords.reduce((sum, r) => sum + (r.totalVolume || 0), 0);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recentRecords = records.filter(r => new Date(r.date) >= last30Days);

  const calendarData = {};
  recentRecords.forEach(record => {
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    calendarData[dateStr] = (calendarData[dateStr] || 0) + 1;
  });

  res.json({
    weeklyTrainingDays: totalDays,
    weeklyTotalDuration: totalDuration,
    weeklyTotalVolume: totalVolume,
    calendarData
  });
});

app.get('/api/analysis/one-rep-max/:exerciseId', (req, res) => {
  const exerciseId = req.params.exerciseId;
  const exercise = exercises.find(e => e._id == exerciseId);
  const exerciseName = exercise?.name || '';
  
  const oneRepMaxData = records.map(record => {
    const exerciseRecord = record.exercises.find(e => e.exerciseName === exerciseName);
    if (!exerciseRecord || exerciseRecord.sets.length === 0) return null;
    
    const bestSet = exerciseRecord.sets.reduce((best, set) => {
      const estimate = set.weight * (1 + set.reps / 30);
      return estimate > (best.estimate || 0) ? { weight: set.weight, reps: set.reps, estimate, date: record.date } : best;
    }, { estimate: 0 });
    
    return {
      date: record.date,
      oneRepMax: Math.round(bestSet.estimate)
    };
  }).filter(Boolean);

  res.json(oneRepMaxData);
});

app.get('/api/analysis/weekly-volume', (req, res) => {
  const weeklyData = {};
  records.forEach(record => {
    const date = new Date(record.date);
    const weekKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${Math.ceil(date.getDate() / 7)}`;
    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (record.totalVolume || 0);
  });

  const result = Object.entries(weeklyData).map(([week, volume]) => ({
    week,
    volume
  }));

  res.json(result);
});

app.get('/api/analysis/body-metrics', (req, res) => {
  res.json(bodyMetrics.sort((a, b) => new Date(a.date) - new Date(b.date)));
});

app.post('/api/analysis/body-metrics', (req, res) => {
  const metrics = { ...req.body, _id: metricsIdCounter++ };
  bodyMetrics.push(metrics);
  res.status(201).json(metrics);
});

app.get('/api/analysis/personal-records', (req, res) => {
  const prs = {};
  records.forEach(record => {
    record.exercises.forEach(exercise => {
      if (exercise.type === 'superset') {
        exercise.exercises.forEach(subEx => {
          const exerciseName = subEx.exerciseName;
          subEx.sets.forEach(set => {
            const estimate = set.weight * (1 + set.reps / 30);
            if (!prs[exerciseName] || estimate > prs[exerciseName].estimate) {
              prs[exerciseName] = {
                exerciseName,
                weight: set.weight,
                reps: set.reps,
                oneRepMax: Math.round(estimate),
                date: record.date,
                muscleGroup: exercises.find(e => e.name === exerciseName)?.muscleGroup || 'Unknown'
              };
            }
          });
        });
      } else if (exercise.type === 'dropSet') {
        const exerciseName = exercise.exerciseName;
        exercise.sets.forEach(set => {
          const estimate = set.weight * (1 + set.reps / 30);
          if (!prs[exerciseName] || estimate > prs[exerciseName].estimate) {
            prs[exerciseName] = {
              exerciseName,
              weight: set.weight,
              reps: set.reps,
              oneRepMax: Math.round(estimate),
              date: record.date,
              muscleGroup: exercises.find(e => e.name === exerciseName)?.muscleGroup || 'Unknown'
            };
          }
        });
      } else {
        const exerciseName = exercise.exerciseName;
        exercise.sets.forEach(set => {
          const estimate = set.weight * (1 + set.reps / 30);
          if (!prs[exerciseName] || estimate > prs[exerciseName].estimate) {
            prs[exerciseName] = {
              exerciseName,
              weight: set.weight,
              reps: set.reps,
              oneRepMax: Math.round(estimate),
              date: record.date,
              muscleGroup: exercises.find(e => e.name === exerciseName)?.muscleGroup || 'Unknown'
            };
          }
        });
      }
    });
  });

  res.json(Object.values(prs));
});

app.get('/api/analysis/muscle-group-distribution', (req, res) => {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weeklyRecords = records.filter(r => {
    const date = new Date(r.date);
    return date >= weekStart && date < weekEnd;
  });

  const distribution = {};
  weeklyRecords.forEach(record => {
    record.exercises.forEach(exercise => {
      if (exercise.type === 'superset') {
        exercise.exercises.forEach(subEx => {
          const muscleGroup = exercises.find(e => e.name === subEx.exerciseName)?.muscleGroup || 'Unknown';
          const volume = subEx.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
          distribution[muscleGroup] = (distribution[muscleGroup] || 0) + volume;
        });
      } else if (exercise.type === 'dropSet') {
        const muscleGroup = exercises.find(e => e.name === exercise.exerciseName)?.muscleGroup || 'Unknown';
        const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        distribution[muscleGroup] = (distribution[muscleGroup] || 0) + volume;
      } else {
        const muscleGroup = exercises.find(e => e.name === exercise.exerciseName)?.muscleGroup || 'Unknown';
        const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        distribution[muscleGroup] = (distribution[muscleGroup] || 0) + volume;
      }
    });
  });

  res.json(distribution);
});

app.get('/api/friends/invite-code', (req, res) => {
  const user = users[0];
  res.json({ inviteCode: user.inviteCode });
});

app.post('/api/friends/add', (req, res) => {
  const { inviteCode } = req.body;
  const friendUser = users.find(u => u.inviteCode === inviteCode);
  
  if (!friendUser) {
    return res.status(404).json({ error: '邀请码无效' });
  }
  
  const existingFriend = friends.find(f => 
    (f.userId === 1 && f.friendId === friendUser._id) ||
    (f.userId === friendUser._id && f.friendId === 1)
  );
  
  if (existingFriend) {
    return res.status(400).json({ error: '已经是好友' });
  }
  
  friends.push({ userId: 1, friendId: friendUser._id });
  friends.push({ userId: friendUser._id, friendId: 1 });
  
  res.json({ message: '添加成功', friend: friendUser });
});

app.get('/api/friends/list', (req, res) => {
  const userFriends = friends.filter(f => f.userId === 1);
  const friendIds = userFriends.map(f => f.friendId);
  const friendUsers = users.filter(u => friendIds.includes(u._id));
  
  const friendsWithStatus = friendUsers.map(friend => {
    const friendRecords = records.filter(r => {
      const date = new Date(r.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo;
    });
    
    const recentRecord = friendRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    return {
      ...friend,
      recentTrainingDate: recentRecord?.date || null,
      weeklyTrainings: friendRecords.length
    };
  });
  
  res.json(friendsWithStatus);
});

app.post('/api/challenges/create', (req, res) => {
  const { name, targetVolume, muscleGroup } = req.body;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const challenge = {
    _id: challengeIdCounter++,
    name,
    targetVolume,
    muscleGroup,
    startDate,
    endDate,
    participants: [{ userId: 1, progress: 0, dailyProgress: {} }],
    createdAt: new Date()
  };
  
  challenges.push(challenge);
  res.status(201).json(challenge);
});

app.post('/api/challenges/:id/join', (req, res) => {
  const challengeId = parseInt(req.params.id);
  const challenge = challenges.find(c => c._id === challengeId);
  
  if (!challenge) {
    return res.status(404).json({ error: '挑战不存在' });
  }
  
  const alreadyJoined = challenge.participants.some(p => p.userId === 1);
  if (alreadyJoined) {
    return res.status(400).json({ error: '已加入此挑战' });
  }
  
  challenge.participants.push({ userId: 1, progress: 0, dailyProgress: {} });
  res.json({ message: '加入成功', challenge });
});

app.get('/api/challenges', (req, res) => {
  const userChallenges = challenges.filter(c => c.participants.some(p => p.userId === 1));
  res.json(userChallenges);
});

app.get('/api/challenges/:id', (req, res) => {
  const challengeId = parseInt(req.params.id);
  const challenge = challenges.find(c => c._id === challengeId);
  
  if (!challenge) {
    return res.status(404).json({ error: '挑战不存在' });
  }
  
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  challenge.participants.forEach(participant => {
    const participantRecords = records.filter(r => {
      const date = new Date(r.date);
      return date >= sevenDaysAgo && date <= now;
    });
    
    let totalProgress = 0;
    const dailyProgress = {};
    
    participantRecords.forEach(record => {
      record.exercises.forEach(exercise => {
        if (exercise.type === 'superset') {
          exercise.exercises.forEach(subEx => {
            const ex = exercises.find(e => e.name === subEx.exerciseName);
            if (ex && ex.muscleGroup === challenge.muscleGroup) {
              const volume = subEx.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
              totalProgress += volume;
              const dateStr = new Date(record.date).toISOString().split('T')[0];
              dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + volume;
            }
          });
        } else if (exercise.type === 'dropSet') {
          const ex = exercises.find(e => e.name === exercise.exerciseName);
          if (ex && ex.muscleGroup === challenge.muscleGroup) {
            const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
            totalProgress += volume;
            const dateStr = new Date(record.date).toISOString().split('T')[0];
            dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + volume;
          }
        } else {
          const ex = exercises.find(e => e.name === exercise.exerciseName);
          if (ex && ex.muscleGroup === challenge.muscleGroup) {
            const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
            totalProgress += volume;
            const dateStr = new Date(record.date).toISOString().split('T')[0];
            dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + volume;
          }
        }
      });
    });
    
    participant.progress = totalProgress;
    participant.dailyProgress = dailyProgress;
  });
  
  challenge.participants.sort((a, b) => b.progress - a.progress);
  
  res.json(challenge);
});

app.get('/api/analysis/fatigue-index', (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];
  const fatigueIndex = {};
  
  muscleGroups.forEach(group => {
    let totalVolume = 0;
    let trainingDays = 0;
    const trainingDates = [];
    
    records.forEach(record => {
      const date = new Date(record.date);
      if (date >= sevenDaysAgo) {
        record.exercises.forEach(exercise => {
          if (exercise.type === 'superset') {
            exercise.exercises.forEach(subEx => {
              const ex = exercises.find(e => e.name === subEx.exerciseName);
              if (ex && ex.muscleGroup === group) {
                const volume = subEx.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
                totalVolume += volume;
                if (!trainingDates.includes(date.toDateString())) {
                  trainingDates.push(date.toDateString());
                  trainingDays++;
                }
              }
            });
          } else if (exercise.type === 'dropSet') {
            const ex = exercises.find(e => e.name === exercise.exerciseName);
            if (ex && ex.muscleGroup === group) {
              const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
              totalVolume += volume;
              if (!trainingDates.includes(date.toDateString())) {
                trainingDates.push(date.toDateString());
                trainingDays++;
              }
            }
          } else {
            const ex = exercises.find(e => e.name === exercise.exerciseName);
            if (ex && ex.muscleGroup === group) {
              const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
              totalVolume += volume;
              if (!trainingDates.includes(date.toDateString())) {
                trainingDates.push(date.toDateString());
                trainingDays++;
              }
            }
          }
        });
      }
    });
    
    const baseFatigue = Math.min((totalVolume / 1000) * 10, 30);
    const frequencyFactor = Math.min(trainingDays * 15, 45);
    
    let recencyFactor = 0;
    if (trainingDates.length > 0) {
      const lastTrainingDate = new Date(trainingDates[trainingDates.length - 1]);
      const daysSinceLastTraining = Math.floor((now - lastTrainingDate) / (1000 * 60 * 60 * 24));
      if (daysSinceLastTraining === 0) recencyFactor = 30;
      else if (daysSinceLastTraining === 1) recencyFactor = 20;
      else if (daysSinceLastTraining === 2) recencyFactor = 10;
    }
    
    fatigueIndex[group] = Math.min(Math.round(baseFatigue + frequencyFactor + recencyFactor), 100);
  });
  
  res.json(fatigueIndex);
});

app.get('/api/analysis/training-recommendation', (req, res) => {
  const fatigueIndex = {};
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];
  
  muscleGroups.forEach(group => {
    let totalVolume = 0;
    let trainingDays = 0;
    const trainingDates = [];
    
    records.forEach(record => {
      const date = new Date(record.date);
      if (date >= sevenDaysAgo) {
        record.exercises.forEach(exercise => {
          if (exercise.type === 'superset') {
            exercise.exercises.forEach(subEx => {
              const ex = exercises.find(e => e.name === subEx.exerciseName);
              if (ex && ex.muscleGroup === group) {
                const volume = subEx.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
                totalVolume += volume;
                if (!trainingDates.includes(date.toDateString())) {
                  trainingDates.push(date.toDateString());
                  trainingDays++;
                }
              }
            });
          } else if (exercise.type === 'dropSet') {
            const ex = exercises.find(e => e.name === exercise.exerciseName);
            if (ex && ex.muscleGroup === group) {
              const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
              totalVolume += volume;
              if (!trainingDates.includes(date.toDateString())) {
                trainingDates.push(date.toDateString());
                trainingDays++;
              }
            }
          } else {
            const ex = exercises.find(e => e.name === exercise.exerciseName);
            if (ex && ex.muscleGroup === group) {
              const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
              totalVolume += volume;
              if (!trainingDates.includes(date.toDateString())) {
                trainingDates.push(date.toDateString());
                trainingDays++;
              }
            }
          }
        });
      }
    });
    
    const baseFatigue = Math.min((totalVolume / 1000) * 10, 30);
    const frequencyFactor = Math.min(trainingDays * 15, 45);
    
    let recencyFactor = 0;
    if (trainingDates.length > 0) {
      const lastTrainingDate = new Date(trainingDates[trainingDates.length - 1]);
      const daysSinceLastTraining = Math.floor((now - lastTrainingDate) / (1000 * 60 * 60 * 24));
      if (daysSinceLastTraining === 0) recencyFactor = 30;
      else if (daysSinceLastTraining === 1) recencyFactor = 20;
      else if (daysSinceLastTraining === 2) recencyFactor = 10;
    }
    
    fatigueIndex[group] = Math.min(Math.round(baseFatigue + frequencyFactor + recencyFactor), 100);
  });
  
  const recommendedGroups = muscleGroups.filter(g => fatigueIndex[g] < 30);
  const restGroups = muscleGroups.filter(g => fatigueIndex[g] > 70);
  
  res.json({
    fatigueIndex,
    recommendedGroups,
    restGroups
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});