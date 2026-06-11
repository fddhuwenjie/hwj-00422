import { useState, useEffect } from 'react';
import { BarChart3, Clock, Weight, Calendar, Award, Target, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { analysisApi } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const muscleGroupPositions = {
  '胸': { front: { top: '20%', left: '50%' }, back: null },
  '背': { front: null, back: { top: '20%', left: '50%' } },
  '肩': { front: { top: '15%', left: '50%' }, back: null },
  '臂': { front: { top: '35%', left: '30%' }, back: { top: '35%', left: '70%' } },
  '腿': { front: { top: '70%', left: '50%' }, back: null },
  '核心': { front: { top: '50%', left: '50%' }, back: null }
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [muscleDistribution, setMuscleDistribution] = useState(null);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [fatigueIndex, setFatigueIndex] = useState(null);
  const [trainingRecommendation, setTrainingRecommendation] = useState(null);
  const [showBackView, setShowBackView] = useState(false);

  useEffect(() => {
    analysisApi.dashboard().then(data => {
      setDashboardData(data);
      setCalendarData(data.calendarData || {});
    });
    analysisApi.muscleGroupDistribution().then(setMuscleDistribution);
    analysisApi.personalRecords().then(data => setPersonalRecords(data.slice(0, 5)));
    analysisApi.fatigueIndex().then(setFatigueIndex);
    analysisApi.trainingRecommendation().then(setTrainingRecommendation);
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

  const getFatigueColor = (index) => {
    if (index < 30) return 'bg-green-500';
    if (index < 50) return 'bg-yellow-500';
    if (index < 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getFatigueBgColor = (index) => {
    if (index < 30) return 'bg-green-100';
    if (index < 50) return 'bg-yellow-100';
    if (index < 70) return 'bg-orange-100';
    return 'bg-red-100';
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

      {trainingRecommendation && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            今日训练建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">推荐训练肌群</span>
              </div>
              {trainingRecommendation.recommendedGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trainingRecommendation.recommendedGroups.map(group => (
                    <span key={group} className="px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm">
                      {group}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 text-sm">暂无推荐，所有肌群疲劳适中</p>
              )}
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">建议休息肌群</span>
              </div>
              {trainingRecommendation.restGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trainingRecommendation.restGroups.map(group => (
                    <span key={group} className="px-3 py-1 bg-red-200 text-red-700 rounded-full text-sm">
                      {group}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-red-600 text-sm">暂无需要休息的肌群</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">肌群疲劳热力图</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBackView(false)}
              className={`px-3 py-1 rounded-lg text-sm transition ${!showBackView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              正面
            </button>
            <button
              onClick={() => setShowBackView(true)}
              className={`px-3 py-1 rounded-lg text-sm transition ${showBackView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              背面
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-96 bg-gray-100 rounded-full">
            <div className="absolute inset-4 border-4 border-gray-300 rounded-full"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-20 bg-gray-200 rounded-t-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-28 h-32 bg-gray-200 rounded-lg"></div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-24 bg-gray-200 rounded-b-full"></div>
            
            {fatigueIndex && Object.entries(fatigueIndex).map(([group, index]) => {
              const pos = muscleGroupPositions[group];
              const position = showBackView ? pos.back : pos.front;
              if (!position) return null;
              return (
                <div
                  key={group}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ top: position.top, left: position.left }}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${getFatigueColor(index)} opacity-80`}
                    title={`${group}: ${index}%`}
                  />
                  <span className="text-xs text-gray-600 mt-1">{group}</span>
                  <span className="text-xs text-gray-500">{index}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">低疲劳 (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">中低疲劳</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">中高疲劳</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">高疲劳 (&gt;70%)</span>
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

      {fatigueIndex && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">肌群疲劳指数详情</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(fatigueIndex).map(([group, index]) => (
              <div key={group} className={`p-4 rounded-lg ${getFatigueBgColor(index)}`}>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{group}</div>
                  <div className={`text-3xl font-bold mt-2 ${
                    index < 30 ? 'text-green-600' :
                    index < 50 ? 'text-yellow-600' :
                    index < 70 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {index}%
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${getFatigueColor(index)}`}
                      style={{ width: `${index}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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