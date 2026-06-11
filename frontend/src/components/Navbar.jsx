import { Dumbbell, Calendar, BarChart3, TrendingUp, Share2, BookOpen, Users, Trophy } from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: BarChart3 },
  { path: '/exercises', label: '动作库', icon: Dumbbell },
  { path: '/plans', label: '训练计划', icon: Calendar },
  { path: '/training', label: '训练记录', icon: BookOpen },
  { path: '/progress', label: '进步追踪', icon: TrendingUp },
  { path: '/friends', label: '训练伙伴', icon: Users },
  { path: '/challenges', label: '周挑战', icon: Trophy },
  { path: '/share', label: '社交分享', icon: Share2 },
];

export default function Navbar({ currentPage, onPageChange }) {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Dumbbell className="w-8 h-8" />
            健身训练系统
          </h1>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onPageChange(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/20 font-semibold'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}