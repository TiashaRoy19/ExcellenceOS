import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  BrainCircuit, 
  Calendar,
  ChevronRight,
  Plus,
  Loader,
  AlertCircle,
  Square,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ studyMinutes: 0, pomodorosCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quick note text state
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [creatingQuickNote, setCreatingQuickNote] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, notesRes, statsRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/notes'),
        axios.get('/api/analytics/stats')
      ]);

      setTasks(tasksRes.data);
      setNotes(notesRes.data);
      
      // Calculate today's stats from analytics
      if (statsRes.data.length > 0) {
        const today = new Date();
        const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
        const todayStats = statsRes.data.find(s => s.date.split('T')[0] === todayStr);
        if (todayStats) {
          setStats({
            studyMinutes: todayStats.studyMinutes || 0,
            pomodorosCompleted: todayStats.pomodorosCompleted || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const res = await axios.put(`/api/tasks/${taskId}`, {
        completed: !currentCompleted
      });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuickNote = async (e) => {
    e.preventDefault();
    if (!quickNoteTitle.trim()) return;

    setCreatingQuickNote(true);
    try {
      const res = await axios.post('/api/notes', {
        title: quickNoteTitle,
        content: quickNoteContent || '',
        folder: 'Quick Notes'
      });
      setNotes([res.data, ...notes]);
      setQuickNoteTitle('');
      setQuickNoteContent('');
      alert('Quick Note Saved! View it in Smart Notes.');
    } catch (err) {
      console.error(err);
      alert('Failed to save quick note.');
    } finally {
      setCreatingQuickNote(false);
    }
  };

  // Compute stats
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4);
  const tasksWithDeadlines = tasks
    .filter(t => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            {getGreeting()}, {user?.username || 'Learner'}
            <Sparkles className="h-6 w-6 text-emerald-400 pulse-mint" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here is an overview of your productivity today.</p>
        </div>

        {/* Streak / Stats top badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">Current Streak</div>
              <div className="text-sm font-extrabold text-white">{user?.streak || 0} Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
            <Clock className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">Focus Session</div>
              <div className="text-sm font-extrabold text-white">{stats.studyMinutes} mins</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader className="h-10 w-10 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Stack: Tasks & Deadlines */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-850 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                  Today's Pending Tasks
                </h3>
                <Link to="/tasks" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition">
                  <span>Manage Tasks</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500">
                    All caught up! No pending tasks for today.
                  </div>
                ) : (
                  pendingTasks.map(task => (
                    <div 
                      key={task._id}
                      className="p-3 bg-slate-900/40 border border-gray-800/40 hover:border-gray-800 rounded-xl flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task._id, task.completed)}
                          className="text-gray-500 hover:text-emerald-400 transition cursor-pointer"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-semibold text-gray-300 truncate">{task.title}</span>
                      </div>
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-850 shadow-md">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-400" />
                Upcoming Deadlines
              </h3>

              <div className="space-y-2">
                {tasksWithDeadlines.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">
                    No upcoming deadlines found.
                  </div>
                ) : (
                  tasksWithDeadlines.map(task => (
                    <div 
                      key={task._id}
                      className="p-3 bg-slate-900/40 border border-gray-800/40 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                        <span className="text-xs font-semibold text-gray-300 truncate">{task.title}</span>
                      </div>
                      <span className="text-[10px] text-red-400 font-bold shrink-0 bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-md">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Toolkit Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => navigate('/ai')}
                className="glass-panel p-4 rounded-2xl text-left border border-transparent hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition duration-300 cursor-pointer flex flex-col justify-between min-h-[110px]"
              >
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl w-fit">
                  <BrainCircuit className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Summarizer</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Condense lectures & docs</p>
                </div>
              </div>

              <div 
                onClick={() => navigate('/quizzes')}
                className="glass-panel p-4 rounded-2xl text-left border border-transparent hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition duration-300 cursor-pointer flex flex-col justify-between min-h-[110px]"
              >
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl w-fit">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Quizzes</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Test your memory</p>
                </div>
              </div>

              <div 
                onClick={() => navigate('/flashcards')}
                className="glass-panel p-4 rounded-2xl text-left border border-transparent hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition duration-300 cursor-pointer flex flex-col justify-between min-h-[110px]"
              >
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Flashcards</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Generate flashcards</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Stack: Quick Note & Recent Notes */}
          <div className="space-y-6">
            {/* Quick Note Ingestor */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 shadow-md">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                Quick Scratch Note
              </h3>
              
              <form onSubmit={handleCreateQuickNote} className="space-y-3">
                <input
                  type="text"
                  placeholder="Idea or Topic Title..."
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white font-semibold"
                  required
                />
                
                <textarea
                  placeholder="Jot down formulas, homework specs, or scratch thoughts..."
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white resize-none h-20 leading-relaxed"
                />

                <button
                  type="submit"
                  disabled={creatingQuickNote}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {creatingQuickNote ? <Loader className="h-3 w-3 animate-spin" /> : 'Save Scratch Note'}
                </button>
              </form>
            </div>

            {/* Recent Notes Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-850 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  Recent Notes
                </h3>
                <Link to="/notes" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">
                    No notes created yet.
                  </div>
                ) : (
                  notes.slice(0, 3).map(note => (
                    <div 
                      key={note._id}
                      onClick={() => navigate('/notes')}
                      className="p-3 bg-slate-900/40 border border-gray-800/40 rounded-xl hover:border-emerald-500/20 cursor-pointer transition text-left"
                    >
                      <h4 className="text-xs font-bold text-gray-200 truncate">{note.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                        {note.content || 'Empty note...'}
                      </p>
                      <span className="text-[9px] text-gray-500 block mt-2">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
