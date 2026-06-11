import { useState, useEffect } from 'react';
import { Plus, X, Calendar, Dumbbell, Trash2, GripVertical, Save } from 'lucide-react';
import { planApi, exerciseApi } from '../services/api';

const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];
const planTemplates = [
  { name: '增肌', type: 'bulk', description: '高容量训练，促进肌肉增长' },
  { name: '减脂', type: 'cut', description: '高强度间歇，燃烧脂肪' },
  { name: '力量', type: 'strength', description: '低次数大重量，提升力量' },
  { name: '维持', type: 'maintain', description: '均衡训练，维持状态' }
];

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    type: 'bulk',
    days: daysOfWeek.map((name, index) => ({
      day: index + 1,
      name,
      muscleGroup: '',
      exercises: []
    }))
  });

  useEffect(() => {
    planApi.getAll().then(setPlans);
    exerciseApi.getAll().then(setExercises);
  }, []);

  const handleCreate = () => {
    planApi.create(newPlan).then(() => {
      setShowModal(false);
      setNewPlan({
        name: '',
        type: 'bulk',
        days: daysOfWeek.map((name, index) => ({
          day: index + 1,
          name,
          muscleGroup: '',
          exercises: []
        }))
      });
      planApi.getAll().then(setPlans);
    });
  };

  const addExerciseToDay = (dayIndex) => {
    setNewPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? { ...day, exercises: [...day.exercises, { exerciseId: '', sets: 4, reps: 10, weight: 0 }] }
          : day
      )
    }));
  };

  const removeExerciseFromDay = (dayIndex, exerciseIndex) => {
    setNewPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? { ...day, exercises: day.exercises.filter((_, j) => j !== exerciseIndex) }
          : day
      )
    }));
  };

  const updateExerciseField = (dayIndex, exerciseIndex, field, value) => {
    setNewPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) =>
                j === exerciseIndex ? { ...ex, [field]: value } : ex
              )
            }
          : day
      )
    }));
  };

  const moveExercise = (dayIndex, fromIndex, toIndex) => {
    setNewPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) => {
                if (j === fromIndex) return prev.days[i].exercises[toIndex];
                if (j === toIndex) return prev.days[i].exercises[fromIndex];
                return ex;
              })
            }
          : day
      )
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">训练计划</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          创建计划
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan._id} className="bg-white rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{plan.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.type === 'bulk' ? 'bg-green-100 text-green-700' :
                plan.type === 'cut' ? 'bg-orange-100 text-orange-700' :
                plan.type === 'strength' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {planTemplates.find(t => t.type === plan.type)?.name}
              </span>
            </div>
            <div className="space-y-2">
              {plan.days.filter(d => d.exercises.length > 0).map(day => (
                <div key={day.day} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{day.name}</span>
                    {day.muscleGroup && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {day.muscleGroup}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{day.exercises.length}个动作</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto max-h-screen">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">创建周训练计划</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划名称</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：增肌计划A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">计划模板</label>
                  <select
                    value={newPlan.type}
                    onChange={(e) => setNewPlan({...newPlan, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {planTemplates.map(template => (
                      <option key={template.type} value={template.type}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {newPlan.days.map((day, dayIndex) => (
                  <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">{day.name}</h4>
                      <select
                        value={day.muscleGroup}
                        onChange={(e) => setNewPlan(prev => ({
                          ...prev,
                          days: prev.days.map((d, i) =>
                            i === dayIndex ? { ...d, muscleGroup: e.target.value } : d
                          )
                        }))}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">选择训练部位</option>
                        {muscleGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      {day.exercises.map((exercise, exerciseIndex) => {
                        const selectedExercise = exercises.find(e => e._id === exercise.exerciseId);
                        return (
                          <div key={exerciseIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <button
                              onClick={() => exerciseIndex > 0 && moveExercise(dayIndex, exerciseIndex, exerciseIndex - 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            <select
                              value={exercise.exerciseId}
                              onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'exerciseId', e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">选择动作</option>
                              {exercises.filter(e => !day.muscleGroup || e.muscleGroup === day.muscleGroup).map(ex => (
                                <option key={ex._id} value={ex._id}>{ex.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'sets', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="组"
                            />
                            <span>×</span>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="次"
                            />
                            <span>×</span>
                            <input
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => updateExerciseField(dayIndex, exerciseIndex, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="kg"
                            />
                            <button
                              onClick={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => addExerciseToDay(dayIndex)}
                        className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        添加动作
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  保存计划
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
