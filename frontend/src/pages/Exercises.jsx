import { useState, useEffect } from 'react';
import { Search, Plus, Filter, X, Dumbbell, Info } from 'lucide-react';
import { exerciseApi } from '../services/api';

const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];
const equipmentTypes = ['自重', '哑铃', '杠铃', '器械', '绳索'];
const difficultyLevels = ['初级', '中级', '高级'];

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: '胸',
    equipment: '自重',
    description: '',
    difficulty: '初级'
  });

  useEffect(() => {
    loadExercises();
  }, [searchTerm, selectedMuscle, selectedEquipment]);

  const loadExercises = () => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedMuscle) params.muscleGroup = selectedMuscle;
    if (selectedEquipment) params.equipment = selectedEquipment;
    exerciseApi.getAll(params).then(setExercises);
  };

  const handleCreate = () => {
    exerciseApi.create(newExercise).then(() => {
      setShowModal(false);
      setNewExercise({
        name: '',
        muscleGroup: '胸',
        equipment: '自重',
        description: '',
        difficulty: '初级'
      });
      loadExercises();
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '初级': return 'bg-green-100 text-green-700';
      case '中级': return 'bg-yellow-100 text-yellow-700';
      case '高级': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMuscleColor = (muscle) => {
    const colors = {
      '胸': 'bg-pink-100 text-pink-700',
      '背': 'bg-blue-100 text-blue-700',
      '肩': 'bg-purple-100 text-purple-700',
      '臂': 'bg-orange-100 text-orange-700',
      '腿': 'bg-green-100 text-green-700',
      '核心': 'bg-red-100 text-red-700'
    };
    return colors[muscle] || 'bg-gray-100 text-gray-700';
  };

  const getEquipmentColor = (equipment) => {
    const colors = {
      '自重': 'bg-gray-100 text-gray-700',
      '哑铃': 'bg-yellow-100 text-yellow-700',
      '杠铃': 'bg-blue-100 text-blue-700',
      '器械': 'bg-purple-100 text-purple-700',
      '绳索': 'bg-green-100 text-green-700'
    };
    return colors[equipment] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">动作库</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          添加动作
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索动作名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">全部肌群</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">全部器械</option>
                {equipmentTypes.map(equipment => (
                  <option key={equipment} value={equipment}>{equipment}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map(exercise => (
          <div key={exercise._id} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-600" />
                {exercise.name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMuscleColor(exercise.muscleGroup)}`}>
                {exercise.muscleGroup}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEquipmentColor(exercise.equipment)}`}>
                {exercise.equipment}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              {exercise.description}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">添加新动作</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">动作名称</label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目标肌群</label>
                  <select
                    value={newExercise.muscleGroup}
                    onChange={(e) => setNewExercise({...newExercise, muscleGroup: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {muscleGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">器械类型</label>
                  <select
                    value={newExercise.equipment}
                    onChange={(e) => setNewExercise({...newExercise, equipment: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {equipmentTypes.map(equipment => (
                      <option key={equipment} value={equipment}>{equipment}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">难度等级</label>
                <select
                  value={newExercise.difficulty}
                  onChange={(e) => setNewExercise({...newExercise, difficulty: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">动作说明</label>
                <textarea
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
