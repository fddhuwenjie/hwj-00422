import { useState, useEffect } from 'react';
import { Users, Copy, Check, Plus, User, Calendar, Activity } from 'lucide-react';
import { friendApi } from '../services/api';

export default function Friends() {
  const [inviteCode, setInviteCode] = useState('');
  const [friends, setFriends] = useState([]);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    friendApi.getInviteCode().then(data => setInviteCode(data.inviteCode));
    friendApi.getFriends().then(setFriends);
  }, []);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addFriend = () => {
    if (!inputCode.trim()) {
      setError('请输入邀请码');
      return;
    }
    friendApi.addFriend(inputCode.trim()).then(data => {
      if (data.error) {
        setError(data.error);
        setSuccess('');
      } else {
        setSuccess('添加好友成功!');
        setError('');
        setInputCode('');
        friendApi.getFriends().then(setFriends);
      }
    }).catch(() => {
      setError('添加失败，请重试');
      setSuccess('');
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '暂无训练记录';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">训练伙伴</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            我的邀请码
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-lg p-4 text-center">
              <span className="text-2xl font-mono font-bold text-gray-800">{inviteCode}</span>
            </div>
            <button
              onClick={copyInviteCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            分享此邀请码给朋友，他们可以使用它来添加你为训练伙伴。
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            添加伙伴
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError('');
                setSuccess('');
              }}
              placeholder="输入好友邀请码"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addFriend}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加好友
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          我的伙伴 ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无训练伙伴</p>
            <p className="text-sm">使用邀请码添加好友开始一起训练!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{friend.name}</div>
                    <div className="text-sm text-gray-500">邀请码: {friend.inviteCode}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>最近训练: {formatDate(friend.recentTrainingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>本周训练: {friend.weeklyTrainings} 次</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}