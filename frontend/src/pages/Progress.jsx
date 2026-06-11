import { useState, useEffect } from 'react';
import { TrendingUp, Weight, Ruler, Activity } from 'lucide-react';
import { analysisApi, exerciseApi } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Progress() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exercises, setExercises] = useState([]);
  const [oneRepMaxData, setOneRepMaxData] = useState([]);
  const [weeklyVolumeData, setWeeklyVolumeData] = useState([]);
  const [bodyMetrics, setBodyMetrics] = useState([]);
  const [showAddMetricsModal, setShowAddMetricsModal] = useState(false);
  const [newMetrics, setNewMetrics] = useState({ weight: '', chest: '', waist: '', arms: '', legs: '' });

  useEffect(() => {
    exerciseApi.getAll().then(setExercises);
    analysisApi.weeklyVolume().then(setWeeklyVolumeData);
    analysisApi.bodyMetrics().then(setBodyMetrics);
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      analysisApi.oneRepMax(selectedExercise).then(setOneRepMaxData);
    }
  }, [selectedExercise]);

  const handleAddMetrics = () => {
    const data = {
      date: new Date(),
      weight: parseFloat(newMetrics.weight) || null,
      chest: parseFloat(newMetrics.chest) || null,
      waist: parseFloat(newMetrics.waist) || null,
      arms: parseFloat(newMetrics.arms) || null,
      legs: parseFloat(newMetrics.legs) || null
    };
    analysisApi.addBodyMetrics(data).then(() => {
      analysisApi.bodyMetrics().then(setBodyMetrics);
      setShowAddMetricsModal(false);
      setNewMetrics({ weight: '', chest: '', waist: '', arms: '', legs: '' });
    });
  };

  const oneRepMaxChartData = oneRepMaxData.length > 0 ? {
    labels: oneRepMaxData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [{
      label: '1RM (kg)',
      data: oneRepMaxData.map(d => d.oneRepMax),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.3,
      fill: true
    }]
  } : null;

  const weeklyVolumeChartData = weeklyVolumeData.length > 0 ? {
    labels: weeklyVolumeData.map(d => d.week),
    datasets: [{
      label: '训练容量',
      data: weeklyVolumeData.map(d => d.volume),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      tension: 0.3,
      fill: true
    }]
  } : null;

  const weightChartData = bodyMetrics.filter(m => m.weight).length > 0 ? {
    labels: bodyMetrics.filter(m => m.weight).map(m => {
      const date = new Date(m.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [{
      label: '体重 (kg)',
      data: bodyMetrics.filter(m => m.weight).map(m => m.weight),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      tension: 0.3,
      fill: true
    }]
  } : null;

  const bodyMeasurementsChartData = bodyMetrics.length > 0 ? {
    labels: bodyMetrics.map(m => {
      const date = new Date(m.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '胸围',
        data: bodyMetrics.map(m => m.chest || null),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.3
      },
      {
        label: '腰围',
        data: bodyMetrics.map(m => m.waist || null),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3
      },
      {
        label: '臂围',
        data: bodyMetrics.map(m => m.arms || null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3
      },
      {
        label: '腿围',
        data: bodyMetrics.map(m => m.legs || null),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.3
      }
    ]
  } : null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">进步追踪</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              1RM 趋势
            </h3>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">选择动作</option>
              {exercises.map(exercise => (
                <option key={exercise._id} value={exercise._id}>{exercise.name}</option>
              ))}
            </select>
          </div>
          {oneRepMaxChartData ? (
            <div className="h-64">
              <Line data={oneRepMaxChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无数据</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            训练容量周趋势
          </h3>
          {weeklyVolumeChartData ? (
            <div className="h-64">
              <Line data={weeklyVolumeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无数据</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Weight className="w-5 h-5 text-red-600" />
              体重记录
            </h3>
            <button
              onClick={() => setShowAddMetricsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              添加记录
            </button>
          </div>
          {weightChartData ? (
            <div className="h-64">
              <Line data={weightChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无数据</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-purple-600" />
            身体围度记录
          </h3>
          {bodyMeasurementsChartData ? (
            <div className="h-64">
              <Line data={bodyMeasurementsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无数据</p>
          )}
        </div>
      </div>

      {showAddMetricsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加身体指标</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  value={newMetrics.weight}
                  onChange={(e) => setNewMetrics({...newMetrics, weight: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">胸围 (cm)</label>
                <input
                  type="number"
                  value={newMetrics.chest}
                  onChange={(e) => setNewMetrics({...newMetrics, chest: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">腰围 (cm)</label>
                <input
                  type="number"
                  value={newMetrics.waist}
                  onChange={(e) => setNewMetrics({...newMetrics, waist: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">臂围 (cm)</label>
                <input
                  type="number"
                  value={newMetrics.arms}
                  onChange={(e) => setNewMetrics({...newMetrics, arms: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">腿围 (cm)</label>
                <input
                  type="number"
                  value={newMetrics.legs}
                  onChange={(e) => setNewMetrics({...newMetrics, legs: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMetricsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleAddMetrics}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
