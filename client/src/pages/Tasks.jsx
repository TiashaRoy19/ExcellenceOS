import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Calendar, 
  AlertCircle, 
  Tag, 
  Filter, 
  TrendingUp,
  Loader,
  CircleAlert
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskCategory, setTaskCategory] = useState('General');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Filters state
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setAddingTask(true);
    try {
      const res = await axios.post('/api/tasks', {
        title: taskTitle,
        priority: taskPriority,
        category: taskCategory,
        deadline: taskDeadline || null
      });
      setTasks([res.data, ...tasks]);
      setTaskTitle('');
      setTaskPriority('medium');
      setTaskCategory('General');
      setTaskDeadline('');
    } catch (err) {
      console.error(err);
      setError('Failed to add task.');
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const res = await axios.put(`/api/tasks/${taskId}`, {
        completed: !currentCompleted
      });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
      setError('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    }
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !task.completed) ||
      (filterStatus === 'completed' && task.completed);
    
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getCompletedCount = () => tasks.filter(t => t.completed).length;
  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    return Math.round((getCompletedCount() / tasks.length) * 100);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-emerald-400" />
            Task Manager
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize your academic duties and track your completion rates</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-sm">
          <CircleAlert className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Overall Completion</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{getCompletedCount()}</span>
            <span className="text-gray-500 text-sm">/ {tasks.length} tasks done</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{getCompletionRate()}% rate</span>
            </div>
            <div className="text-[10px] text-gray-500">Keep it up!</div>
          </div>
          {/* Progress bar visual */}
          <div className="w-32 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-gray-800">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getCompletionRate()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Create Task Form */}
        <div className="glass-panel p-6 rounded-2xl h-fit border border-gray-850">
          <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-400" />
            Create Task
          </h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Task Title</label>
              <input
                type="text"
                placeholder="Submit physics report..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs font-medium bg-slate-950"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category</label>
                <input
                  type="text"
                  placeholder="Exam, Homework..."
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Deadline</label>
              <div className="relative">
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full pl-3 pr-3 py-2.5 rounded-xl glass-input text-white text-xs bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addingTask}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-black font-bold rounded-xl transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {addingTask ? <Loader className="h-3.5 w-3.5 animate-spin" /> : 'Create Task'}
            </button>
          </form>
        </div>

        {/* Right Column: Task List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-gray-400">Filters:</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-xs text-gray-300 font-semibold focus:outline-none border-b border-transparent focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">All Tasks</option>
                  <option value="active">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Priority:</span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-transparent text-xs text-gray-300 font-semibold focus:outline-none border-b border-transparent focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader className="h-8 w-8 text-emerald-400 animate-spin" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="glass-panel p-8 text-center text-sm text-gray-500 rounded-2xl">
                No matching tasks found
              </div>
            ) : (
              <AnimatePresence>
                {filteredTasks.map(task => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`glass-panel p-4 rounded-xl flex items-center justify-between gap-4 border border-transparent hover:border-gray-800/60 ${
                      task.completed ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task._id, task.completed)}
                        className="text-emerald-400 hover:text-emerald-300 transition shrink-0 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-5 w-5 fill-emerald-500/10" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-600" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-200'
                        }`}>
                          {task.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          <span className="flex items-center gap-0.5 text-[9px] font-medium text-gray-400 bg-slate-900 px-2 py-0.5 rounded-full border border-gray-800">
                            <Tag className="h-2.5 w-2.5 text-gray-500" />
                            {task.category}
                          </span>

                          {task.deadline && (
                            <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
