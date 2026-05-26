import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Timer, 
  BrainCircuit, 
  FileQuestion, 
  Layers, 
  BarChart2, 
  LogOut, 
  Flame, 
  Sparkles 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Smart Notes', path: '/notes', icon: BookOpen },
    { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
    { name: 'Pomodoro Timer', path: '/timer', icon: Timer },
    { name: 'AI Summarizer', path: '/ai', icon: BrainCircuit },
    { name: 'AI Quizzes', path: '/quizzes', icon: FileQuestion },
    { name: 'AI Flashcards', path: '/flashcards', icon: Layers },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="w-64 h-screen glass-panel flex flex-col border-r border-gray-800 shrink-0 sticky top-0">
      {/* Top Brand Info */}
      <div className="p-6 border-b border-gray-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          <span className="font-extrabold text-lg text-white tracking-tight">ExcellenceOS</span>
        </div>
      </div>

      {/* User Info & Streak */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-800/40 bg-slate-900/20">
          <div className="text-sm font-semibold text-gray-200 truncate">{user.username}</div>
          <div className="text-xs text-gray-400 truncate mb-2">{user.email}</div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-400">{user.streak || 0} Day Streak</span>
          </div>
        </div>
      )}

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-800/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
