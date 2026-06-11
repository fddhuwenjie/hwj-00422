import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Stop, Plus, Check, Clock, Timer, Save, Dumbbell } from 'lucide-react';
import { planApi, exerciseApi, recordApi } from '../services/api';

const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function Training() {
  const [mode, setMode] = useState('select');
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [todayPlan, setTodayPlan] = useState(null);
  const [trainingExercises, setTrainingExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [restDuration, setRestDuration] = useState(60);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const timerRef = useRef(null);
  const trainingTimerRef = useRef(null);

  useEffect(() => {
    planApi.getAll().then(setPlans);
    exerciseApi.getAll().then(setExercises);
  }, []);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      timerRef.current = setTimeout(() => setRestTimer(prev => prev - 1), 1000);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isResting, restTimer]);

  useEffect(() => {
    if (isTraining) {
      trainingTimerRef.current = setInterval(() => setTotalDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(trainingTimerRef.current);
  }, [isTraining]);

  const getTodayDayIndex = () => {
    const today = new Date();
    return today.getDay();
  };

  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    const todayIndex = getTodayDayIndex();
    const todayDayPlan = plan.days.find(d => d.day === todayIndex);
    setTodayPlan(todayDayPlan);
    if (todayDayPlan) {
      const exercisesWithSets = todayDayPlan.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseId ? exercises.find(e => e._id === ex.exerciseId)?.name : '',
        targetSets: ex.sets,
        targetReps: ex.reps,
        targetWeight: ex.weight,
        sets: Array(ex.sets).fill(null).map(() => ({ weight: ex.weight, reps: 0, completed: false }))
      }));
      setTrainingExercises(exercisesWithSets);
    }
  };

  const startTraining = () => {
    setIsTraining(true);
    setMode('training');
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setTotalDuration(0);
  };

  const completeSet = (weight, reps) => {
    setTrainingExercises(prev => prev.map((ex, exIndex) => {
      if (exIndex === currentExerciseIndex) {
        return {
          ...ex,
          sets: ex.sets.map((set, setIndex) => {
            if (setIndex === currentSetIndex) {
              return { ...set, weight, reps, completed: true };
            }
            return set;
          })
        };
      }
      return ex;
    }));

    const currentExercise = trainingExercises[currentExerciseIndex];
    if (currentSetIndex < currentExercise.targetSets - 1) {
      setCurrentSetIndex(prev => prev + 1);
    } else if (currentExerciseIndex < trainingExercises.length - 1) {
      setIsResting(true);
      setRestTimer(restDuration);
      setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
      }, restDuration * 1000);
    } else {
      setIsTraining(false);
      setMode('complete');
    }
  };

  const startRest = () => {
    setIsResting(true);
    setRestTimer(restDuration);
  };

  const saveRecord = () => {
    const recordData = {
      date: new Date(),
      planId: selectedPlan?._id,
      exercises: trainingExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets.filter(s => s.completed).map(s => ({ weight: s.weight, reps: s.reps }))
      })).filter(ex => ex.sets.length > 0),
      totalDuration,
      notes: ''
    };
    recordApi.create(recordData).then(() => {
      setShowSaveModal(false);
      setMode('select');
      setSelectedPlan(null);
      setTodayPlan(null);
      setTrainingExercises([]);
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = trainingExercises[currentExerciseIndex];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">训练记录</h2>

      {mode === 'select' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-4">选择今日计划</h3>
              {plans.map(plan => (
                <button
                  key={plan._id}
                  onClick={() => selectPlan(plan)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedPlan?._id === plan._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-gray-800">{plan.name}</div>
                  <div className="text-sm text-gray-500">
                    {daysOfWeek[getTodayDayIndex()]}: {todayPlan?.muscleGroup || '未安排'}
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-4">自由训练</h3>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setTrainingExercises([]);
                  setMode('custom');
                }}
                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition text-gray-500 hover:text-blue-500"
              >
                <Plus className="w-6 h-6 mx-auto mb-2" />
                创建自由训练
              </button>
            </div>
          </div>
          {selectedPlan && todayPlan && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">今日训练计划</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {todayPlan.muscleGroup}
                </span>
              </div>
              <div className="space-y-2">
                {todayPlan.exercises.map((ex, index) => {
                  const exercise = exercises.find(e => e._id === ex.exerciseId);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{exercise?.name || '未知动作'}</span>
                      </div>
                      <span className="text-gray-600">{ex.sets}组 × {ex.reps}次 × {ex.weight}kg</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={startTraining}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                开始训练
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'custom' && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4">自由训练</h3>
          <div className="space-y-4">
            {trainingExercises.map((ex, exIndex) => (
              <div key={exIndex} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <select
                  value={ex.exerciseId}
                  onChange={(e) => setTrainingExercises(prev => prev.map((e, i) =>
                    i === exIndex ? { ...e, exerciseId: e.target.value, exerciseName: exercises.find(ex => ex._id === e.target.value)?.name } : e
                  ))}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="">选择动作</option>
                  {exercises.map(exercise => (
                    <option key={exercise._id} value={exercise._id}>{exercise.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={ex.targetSets}
                  onChange={(e) => setTrainingExercises(prev => prev.map((e, i) =>
                    i === exIndex ? { ...e, targetSets: parseInt(e.target.value) || 1, sets: Array(parseInt(e.target.value) || 1).fill(null).map(() => ({ weight: e.weight, reps: 0, completed: false })) } : e
                  ))}
                  className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center"
                  placeholder="组"
                />
                <input
                  type="number"
                  value={ex.targetReps}
                  onChange={(e) => setTrainingExercises(prev => prev.map((e, i) =>
                    i === exIndex ? { ...e, targetReps: parseInt(e.target.value) || 10 } : e
                  ))}
                  className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center"
                  placeholder="次"
                />
                <input
                  type="number"
                  value={ex.targetWeight}
                  onChange={(e) => setTrainingExercises(prev => prev.map((e, i) =>
                    i === exIndex ? { ...e, targetWeight: parseFloat(e.target.value) || 0 } : e
                  ))}
                  className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center"
                  placeholder="kg"
                />
              </div>
            ))}
            <button
              onClick={() => setTrainingExercises(prev => [...prev, {
                exerciseId: '',
                exerciseName: '',
                targetSets: 4,
                targetReps: 10,
                targetWeight: 0,
                sets: Array(4).fill(null).map(() => ({ weight: 0, reps: 0, completed: false }))
              }])}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加动作
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('select')}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                返回
              </button>
              <button
                onClick={startTraining}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                开始训练
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'training' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">训练中</h3>
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span className="text-2xl font-bold">{formatTime(totalDuration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-blue-200">当前动作</span>
                <h4 className="text-xl font-semibold">{currentExercise?.exerciseName}</h4>
              </div>
              <div className="text-right">
                <span className="text-blue-200">进度</span>
                <p className="text-xl font-semibold">{currentExerciseIndex + 1}/{trainingExercises.length}</p>
              </div>
            </div>
          </div>

          {isResting ? (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 text-center">
              <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-yellow-800 mb-2">休息时间</h3>
              <p className="text-5xl font-bold text-yellow-600">{restTimer}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">第 {currentSetIndex + 1} 组 / {currentExercise?.targetSets} 组</h3>
                <div className="flex gap-2">
                  {currentExercise?.sets.map((set, index) => (
                    <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentSetIndex ? 'bg-green-500 text-white' :
                      index === currentSetIndex ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm text-gray-600 mb-2">重量 (kg)</label>
                  <input
                    type="number"
                    defaultValue={currentExercise?.targetWeight}
                    className="w-full text-2xl font-bold text-center border-b-2 border-blue-500 pb-2 focus:outline-none"
                    ref={(el) => el?.focus()}
                    id="weight-input"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm text-gray-600 mb-2">次数</label>
                  <input
                    type="number"
                    defaultValue={currentExercise?.targetReps}
                    className="w-full text-2xl font-bold text-center border-b-2 border-blue-500 pb-2 focus:outline-none"
                    id="reps-input"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startRest}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  休息 {restDuration}秒
                </button>
                <button
                  onClick={() => {
                    const weight = parseFloat(document.getElementById('weight-input')?.value) || 0;
                    const reps = parseInt(document.getElementById('reps-input')?.value) || 0;
                    completeSet(weight, reps);
                  }}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  完成组
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>目标: {currentExercise?.targetWeight}kg × {currentExercise?.targetReps}次</span>
                <div className="flex items-center gap-2">
                  <span>组间休息:</span>
                  <input
                    type="number"
                    value={restDuration}
                    onChange={(e) => setRestDuration(parseInt(e.target.value) || 60)}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                  />
                  <span>秒</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 shadow-md">
            <h4 className="font-medium text-gray-800 mb-3">训练列表</h4>
            <div className="space-y-2">
              {trainingExercises.map((ex, index) => {
                const completedSets = ex.sets.filter(s => s.completed).length;
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    index === currentExerciseIndex ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <span className="font-medium">{ex.exerciseName}</span>
                    <span className="text-gray-600">{completedSets}/{ex.targetSets} 组</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {mode === 'complete' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
            <Check className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">训练完成!</h3>
            <p className="text-green-200">总时长: {formatTime(totalDuration)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h4 className="font-semibold text-gray-800 mb-4">训练详情</h4>
            <div className="space-y-3">
              {trainingExercises.map((ex, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800 mb-2">{ex.exerciseName}</div>
                  <div className="flex flex-wrap gap-2">
                    {ex.sets.map((set, setIndex) => set.completed && (
                      <span key={setIndex} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {set.weight}kg × {set.reps}次
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            保存训练记录
          </button>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">确认保存</h3>
            <p className="text-gray-600 mb-6">确定要保存这次训练记录吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={saveRecord}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
