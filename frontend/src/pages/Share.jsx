import { useState, useEffect, useRef } from 'react';
import { Share2, Download, Calendar, Dumbbell, Clock, Weight } from 'lucide-react';
import { recordApi, analysisApi } from '../services/api';

export default function Share() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const shareCardRef = useRef(null);

  useEffect(() => {
    recordApi.getAll().then(data => setRecords(data.slice(0, 10)));
    analysisApi.dashboard().then(data => setCalendarData(data.calendarData || {}));
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 60);
    const mins = seconds % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const generateCalendarHeatmap = () => {
    const today = new Date();
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = calendarData[dateStr] || 0;
      
      currentWeek.push({ date: dateStr, count, day: date.getDay() });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return weeks;
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    return 'bg-green-600';
  };

  const exportAsText = () => {
    if (!selectedRecord) return;
    
    const date = new Date(selectedRecord.date);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    
    let text = `=== 训练记录 ===\n\n`;
    text += `日期: ${dateStr}\n`;
    text += `训练时长: ${formatDuration(selectedRecord.totalDuration)}\n`;
    text += `训练容量: ${selectedRecord.totalVolume.toLocaleString()} kg×次\n\n`;
    text += `训练动作:\n`;
    
    selectedRecord.exercises.forEach((ex, index) => {
      text += `${index + 1}. ${ex.exerciseName}\n`;
      ex.sets.forEach((set, setIndex) => {
        text += `   第${setIndex + 1}组: ${set.weight}kg × ${set.reps}次\n`;
      });
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `训练记录_${dateStr}.txt`;
    a.click();
  };

  const weeks = generateCalendarHeatmap();
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">社交分享</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-gray-800">训练日历</h3>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex gap-1 mb-2">
              {weeks.slice(0, 52).filter((_, i) => i % 4 === 0).map((week, index) => {
                const month = new Date(week[0]?.date);
                return (
                  <div key={index} className="flex-1 text-center text-xs text-gray-500">
                    {months[month.getMonth()]}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1">
              <div className="flex flex-col gap-1 mr-2 text-xs text-gray-500">
                <div className="h-3"></div>
                <div className="h-3">一</div>
                <div className="h-3"></div>
                <div className="h-3">三</div>
                <div className="h-3"></div>
                <div className="h-3">五</div>
                <div className="h-3"></div>
              </div>
              <div className="flex-1 flex gap-0.5 overflow-x-auto scrollbar-hide">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.5">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)}`}
                        title={`${day.date}: ${day.count}次训练`}
                      />
                    ))}
                  </div>
                ))}
              </div>
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

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">分享卡片</h3>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <select
              value={selectedRecord?._id || ''}
              onChange={(e) => setSelectedRecord(records.find(r => r._id === e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">选择训练记录</option>
              {records.map(record => {
                const date = new Date(record.date);
                return (
                  <option key={record._id} value={record._id}>
                    {date.getMonth() + 1}/{date.getDate()} - {record.exercises.length}个动作
                  </option>
                );
              })}
            </select>

            <div 
              ref={shareCardRef}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-4"
            >
              {selectedRecord ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold">训练完成!</h4>
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-blue-200">{formatDate(selectedRecord.date)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">训练时长</span>
                      <span className="font-semibold">{formatDuration(selectedRecord.totalDuration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">训练容量</span>
                      <span className="font-semibold">{selectedRecord.totalVolume.toLocaleString()} kg×次</span>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-sm text-blue-200 mb-2">训练动作</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedRecord.exercises.map((ex, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{ex.exerciseName}</span>
                          <span>{ex.sets.length}组</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-blue-200">
                  <Share2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>请选择一条训练记录</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportAsText}
                disabled={!selectedRecord}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                导出文本
              </button>
              <button
                onClick={() => {
                  if (shareCardRef.current) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const rect = shareCardRef.current.getBoundingClientRect();
                    
                    canvas.width = rect.width * 2;
                    canvas.height = rect.height * 2;
                    ctx.scale(2, 2);
                    
                    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
                    gradient.addColorStop(0, '#2563eb');
                    gradient.addColorStop(1, '#4f46e5');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, rect.width, rect.height);
                    
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.fillText('训练完成!', 24, 36);
                    
                    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.fillStyle = '#93c5fd';
                    ctx.fillText(formatDate(selectedRecord.date), 24, 64);
                    
                    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.fillStyle = '#93c5fd';
                    ctx.fillText('训练时长', 24, 92);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.fillText(formatDuration(selectedRecord.totalDuration), rect.width - 24 - ctx.measureText(formatDuration(selectedRecord.totalDuration)).width, 92);
                    
                    ctx.fillStyle = '#93c5fd';
                    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.fillText('训练容量', 24, 116);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
                    ctx.fillText(selectedRecord.totalVolume.toLocaleString() + ' kg×次', rect.width - 24 - ctx.measureText(selectedRecord.totalVolume.toLocaleString() + ' kg×次').width, 116);
                    
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `训练分享_${formatDate(selectedRecord.date).replace(/[年日月]/g, '')}.png`;
                    a.click();
                  }
                }}
                disabled={!selectedRecord}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                导出图片
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
