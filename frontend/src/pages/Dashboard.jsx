import { useState, useEffect } from 'react';
import { BarChart3, Clock, Weight, Calendar, Award, Target } from 'lucide-react';
import { analysisApi } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [muscleDistribution, setMuscleDistribution] = useState(null);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    analysisApi.dashboard().then(data => {
      setDashboardData(data);
      setCalendarData(data.calendarData || {});
    });
    analysisApi.muscleGroupDistribution().then(setMuscleDistribution);
    analysisApi.personalRecords().then(data => setPersonalRecords(data.slice(0, 5)));
  }, []);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const generateCalendarHeatmap = () => {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = calendarData[dateStr] || 0;
      days.push({ date: dateStr, count, day: date.getDay() });
    }
    return days;
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    return 'bg-green-600';
  };

  const muscleChartData = muscleDistribution ? {
    labels: Object.keys(muscleDistribution),
    datasets: [{
      data: Object.values(muscleDistribution),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    }]
  } : null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">数据分析仪表盘</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">本周训练天数</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData?.weeklyTrainingDays || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总训练时长</p>
              <p className="text-2xl font-bold text-gray-800">{formatDuration(dashboardData?.weeklyTotalDuration || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Weight className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总训练容量</p>
              <p className="text-2xl font-bold text-gray-800">{(dashboardData?.weeklyTotalVolume || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">活跃天数(30天)</p>
              <p className="text-2xl font-bold text-gray-800">{Object.keys(calendarData).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">肌群训练分布</h3>
          {muscleChartData ? (
            <Pie data={muscleChartData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-500 text-center py-8">暂无数据</p>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">近30天训练频率</h3>
          <div className="flex gap-1">
            {generateCalendarHeatmap().map((day) => (
              <div key={day.date} className="flex flex-col gap-1">
                <div className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)}`} title={`${day.date}: ${day.count}次训练`} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100" />
              <div className="w-3 h-3 rounded-sm bg-green-200" />
              <div className="w-3 h-3 rounded-sm bg-green-400" />
              <div className="w-3 h-3 rounded-sm bg-green-600" />
            </div>
            <span>多</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          个人记录榜
        </h3>
        <div className="space-y-3">
          {personalRecords.length > 0 ? (
            personalRecords.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{record.exerciseName}</p>
                    <p className="text-sm text-gray-500">{record.muscleGroup}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{record.oneRepMax}kg</p>
                  <p className="text-sm text-gray-500">{record.weight}kg × {record.reps}次</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">暂无记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
