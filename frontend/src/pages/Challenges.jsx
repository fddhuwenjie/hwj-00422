import { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Plus, Users, BarChart3, ChevronRight, Medal } from 'lucide-react';
import { challengeApi } from '../services/api';

const muscleGroups = ['胸', '背', '肩', '臂', '腿', '核心'];

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    targetVolume: '',
    muscleGroup: '胸'
  });

  useEffect(() => {
    challengeApi.getAll().then(setChallenges);
  }, []);

  const createChallenge = () => {
    if (!newChallenge.name || !newChallenge.targetVolume) {
      alert('请填写完整信息');
      return;
    }
    challengeApi.create({
      name: newChallenge.name,
      targetVolume: parseInt(newChallenge.targetVolume),
      muscleGroup: newChallenge.muscleGroup
    }).then(data => {
      setChallenges(prev => [data, ...prev]);
      setShowCreateModal(false);
      setNewChallenge({ name: '', targetVolume: '', muscleGroup: '胸' });
    });
  };

  const joinChallenge = (id) => {
    challengeApi.join(id).then(data => {
      setChallenges(prev => prev.map(c => c._id === id ? data.challenge : c));
    });
  };

  const viewChallenge = (challenge) => {
    challengeApi.getById(challenge._id).then(data => {
      setSelectedChallenge(data);
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getDaysInWeek = (startDate) => {
    const days = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getParticipantProgress = (participant, challenge) => {
    return Math.min(Math.round((participant.progress / challenge.targetVolume) * 100), 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">周挑战</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          创建挑战
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-md text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无挑战</h3>
          <p className="text-gray-500">创建一个新挑战或加入朋友的挑战!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => {
            const isJoined = challenge.participants.some(p => p.userId === 1);
            const myProgress = isJoined 
              ? challenge.participants.find(p => p.userId === 1)?.progress || 0
              : 0;
            const progressPercent = Math.min(Math.round((myProgress / challenge.targetVolume) * 100), 100);
            
            return (
              <div key={challenge._id} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {challenge.muscleGroup}
                  </span>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{challenge.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>目标: {challenge.targetVolume.toLocaleString()}kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants.length} 位参与者</span>
                  </div>
                </div>
                {isJoined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">我的进度</span>
                      <span className="font-medium">{myProgress.toLocaleString()}kg ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => viewChallenge(challenge)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    详情
                  </button>
                  {!isJoined && (
                    <button
                      onClick={() => joinChallenge(challenge._id)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      加入
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">创建新挑战</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">挑战名称</label>
                <input
                  type="text"
                  value={newChallenge.name}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如: 本周深蹲大挑战"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">肌群</label>
                <select
                  value={newChallenge.muscleGroup}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, muscleGroup: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {muscleGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">目标容量 (kg)</label>
                <input
                  type="number"
                  value={newChallenge.targetVolume}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, targetVolume: e.target.value }))}
                  placeholder="例如: 10000"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  onClick={createChallenge}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedChallenge.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {selectedChallenge.muscleGroup}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedChallenge.startDate)} - {formatDate(selectedChallenge.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    目标: {selectedChallenge.targetVolume.toLocaleString()}kg
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                关闭
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Medal className="w-5 h-5 text-yellow-500" />
                排行榜
              </h4>
              <div className="space-y-3">
                {selectedChallenge.participants.map((participant, index) => (
                  <div key={participant.userId} className={`p-3 rounded-lg flex items-center gap-3 ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-100' :
                    index === 2 ? 'bg-orange-50' : 'bg-gray-50'
                  }`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {participant.userId === 1 ? '我' : `参与者 ${participant.userId}`}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${getParticipantProgress(participant, selectedChallenge)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{participant.progress.toLocaleString()}kg</div>
                      <div className="text-sm text-gray-500">{getParticipantProgress(participant, selectedChallenge)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                每日进度
              </h4>
              <div className="space-y-4">
                {getDaysInWeek(selectedChallenge.startDate).map((date) => {
                  const dayName = new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' });
                  return (
                    <div key={date} className="flex items-center gap-4">
                      <div className="w-12 text-sm text-gray-600">{dayName}</div>
                      <div className="flex-1 space-y-1">
                        {selectedChallenge.participants.map((participant) => {
                          const dayProgress = participant.dailyProgress[date] || 0;
                          const percent = Math.min(Math.round((dayProgress / (selectedChallenge.targetVolume / 7)) * 100), 100);
                          return (
                            <div key={participant.userId} className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full bg-blue-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-16">{dayProgress}kg</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}