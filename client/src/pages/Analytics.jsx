import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  BarChart2, 
  Clock, 
  CheckSquare, 
  Sparkles, 
  Flame,
  TrendingUp,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summarized metrics
  const [metrics, setMetrics] = useState({
    totalMinutes: 0,
    totalTasks: 0,
    totalPomodoros: 0,
    totalAiUses: 0
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/analytics/stats');
      const data = res.data;

      // Transform dates into readable days (e.g. "Mon")
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      const formatted = data.map(item => {
        const d = new Date(item.date);
        return {
          ...item,
          dayName: days[d.getDay()],
          dateLabel: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
      });

      // Fill in empty days if less than 7 data points to keep chart looking complete
      while (formatted.length < 7) {
        const prevDate = new Date();
        prevDate.setDate(prevDate.getDate() - (7 - formatted.length));
        formatted.unshift({
          dayName: days[prevDate.getDay()],
          dateLabel: prevDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          studyMinutes: 0,
          tasksCompleted: 0,
          pomodorosCompleted: 0,
          aiGenerationsCount: 0
        });
      }

      setStatsData(formatted);

      // Compute total metrics
      const totals = formatted.reduce((acc, curr) => {
        acc.totalMinutes += curr.studyMinutes || 0;
        acc.totalTasks += curr.tasksCompleted || 0;
        acc.totalPomodoros += curr.pomodorosCompleted || 0;
        acc.totalAiUses += curr.aiGenerationsCount || 0;
        return acc;
      }, { totalMinutes: 0, totalTasks: 0, totalPomodoros: 0, totalAiUses: 0 });

      setMetrics(totals);

    } catch (err) {
      console.error(err);
      setError('Could not fetch analytics statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Custom styling elements for Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-gray-800 text-left text-xs space-y-1.5 shadow-xl">
          <p className="font-extrabold text-white">{payload[0].payload.dateLabel}</p>
          {payload.map((pld, index) => (
            <p key={index} className="font-semibold" style={{ color: pld.color || pld.fill }}>
              {pld.name}: {pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart2 className="h-8 w-8 text-emerald-400" />
          Study Analytics
        </h1>
        <p className="text-gray-400 text-sm mt-1">Visualize your habits, active recall tasks, and study session lengths</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-gray-850 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Study Time</span>
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-3">{metrics.totalMinutes}m</div>
              <p className="text-[10px] text-gray-500 mt-1">Total minutes this week</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-850 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Tasks Completed</span>
                <CheckSquare className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white mt-3">{metrics.totalTasks}</div>
              <p className="text-[10px] text-gray-500 mt-1">Task completions logged</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-850 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">AI Assistants Used</span>
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white mt-3">{metrics.totalAiUses}</div>
              <p className="text-[10px] text-gray-500 mt-1">Quizzes, cards & summaries</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-850 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Active Streak</span>
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-2xl font-black text-white mt-3">{user?.streak || 0} Days</div>
              <p className="text-[10px] text-gray-500 mt-1">Consecutive log-in streak</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Study Minutes (Area) */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 shadow-md lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Weekly Study Trends
                </h3>
                <span className="text-[10px] text-gray-500 font-semibold">Active Minutes</span>
              </div>

              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="dayName" stroke="#475569" tickLine={false} />
                    <YAxis stroke="#475569" tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="studyMinutes" 
                      name="Study Minutes" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMinutes)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: AI Generations (Bar) */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  AI Engagement
                </h3>
                <span className="text-[10px] text-gray-500 font-semibold">Uses / Day</span>
              </div>

              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="dayName" stroke="#475569" tickLine={false} />
                    <YAxis stroke="#475569" tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="aiGenerationsCount" 
                      name="AI Generations" 
                      fill="#8B5CF6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
