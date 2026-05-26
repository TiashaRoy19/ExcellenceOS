import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Coffee, 
  Award,
  Volume2,
  VolumeX,
  Settings,
  X,
  Plus,
  Minus
} from 'lucide-react';

const TimerPage = () => {
  // Timer durations in minutes
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  
  // Timer States
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Stats tracking
  const [todayFocusSessions, setTodayFocusSessions] = useState(0);
  const [todayMinutesLogged, setTodayMinutesLogged] = useState(0);

  const timerRef = useRef(null);

  // Sync mode duration when base configuration changes
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(workDuration * 60);
      else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
      else if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    
    // Play sound if enabled
    if (soundEnabled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
        audio.volume = 0.5;
        audio.play();
      } catch (err) {
        console.error('Audio playback failed:', err);
      }
    }

    if (mode === 'work') {
      alert('Focus session complete! Time for a well-deserved break.');
      setTodayFocusSessions((prev) => prev + 1);
      setTodayMinutesLogged((prev) => prev + workDuration);
      
      // Log session in backend database
      try {
        await axios.post('/api/analytics/log', {
          minutes: workDuration,
          isPomodoro: true
        });
      } catch (err) {
        console.error('Failed to log Pomodoro stats in DB:', err);
      }
      
      // Auto-switch to break
      setMode('shortBreak');
      setTimeLeft(shortBreakDuration * 60);
    } else {
      alert('Break complete! Let\'s get back to work.');
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    if (mode === 'work') setTimeLeft(workDuration * 60);
    else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft(workDuration * 60);
    else if (newMode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else if (newMode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // SVG circular outline percentage
  const totalSeconds = mode === 'work' 
    ? workDuration * 60 
    : mode === 'shortBreak' 
      ? shortBreakDuration * 60 
      : longBreakDuration * 60;
  
  const progressPercent = totalSeconds > 0 
    ? ((totalSeconds - timeLeft) / totalSeconds) * 100 
    : 0;

  // Circle stroke offset properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Coffee className="h-8 w-8 text-emerald-400" />
          Pomodoro Study Timer
        </h1>
        <p className="text-gray-400 text-sm mt-1">Train your focus muscles using interval blocking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-start">
        {/* Left Column: Mode Switches & Settings */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-sm font-bold text-gray-200">Timer Modes</h3>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => changeMode('work')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                mode === 'work'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-transparent border-transparent text-gray-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span>Work / Focus Session</span>
              </div>
              <span className="opacity-80">{workDuration}m</span>
            </button>

            <button
              onClick={() => changeMode('shortBreak')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                mode === 'shortBreak'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-transparent border-transparent text-gray-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                <span>Short Break</span>
              </div>
              <span className="opacity-80">{shortBreakDuration}m</span>
            </button>

            <button
              onClick={() => changeMode('longBreak')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                mode === 'longBreak'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-transparent border-transparent text-gray-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-purple-400" />
                <span>Long Break</span>
              </div>
              <span className="opacity-80">{longBreakDuration}m</span>
            </button>
          </div>

          <div className="border-t border-gray-800/60 pt-4 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-semibold">Sound Notifications</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg cursor-pointer transition border border-gray-700/60"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-gray-700/60"
          >
            <Settings className="h-4 w-4" />
            <span>Customize Durations</span>
          </button>
        </div>

        {/* Center Column: Interactive Circular Timer */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center relative md:col-span-2 min-h-[350px]">
          {/* Circular Countdown Progress */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* SVG Circle indicator */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Track */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                className="stroke-slate-900 fill-transparent"
                strokeWidth="10"
              />
              {/* Progress Bar */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                className={`fill-transparent transition-all duration-300 ${
                  mode === 'work' 
                    ? 'stroke-emerald-500' 
                    : mode === 'shortBreak' 
                      ? 'stroke-blue-500' 
                      : 'stroke-purple-500'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Inner Clock Text */}
            <div className="absolute text-center space-y-1">
              <span className="text-gray-400 text-xs font-extrabold uppercase tracking-widest">
                {mode === 'work' ? 'Focusing' : 'Break Time'}
              </span>
              <div className="text-5xl font-black text-white font-mono tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-opacity-10 capitalize ${
                mode === 'work' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500' : 'text-blue-400 border-blue-500/20 bg-blue-500'
              }`}>
                {isRunning ? 'Running' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-4 mt-6 z-10">
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl cursor-pointer transition border border-gray-700/60"
              title="Reset Timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`py-3 px-8 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                isRunning 
                  ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 fill-black" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-black" />
                  <span>Start Focus</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Session stats bottom deck */}
      <div className="glass-panel p-6 rounded-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-6 border border-gray-850 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Completed Sessions Today</h3>
            <p className="text-xl font-bold text-white mt-0.5">{todayFocusSessions} pomodoros</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Award className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Active Study Log</h3>
            <p className="text-xl font-bold text-white mt-0.5">{todayMinutesLogged} focus minutes</p>
          </div>
        </div>
      </div>

      {/* Customization modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Customize Session Lengths</h3>
            
            <div className="space-y-4">
              {/* Focus input */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Focus Duration</h4>
                  <span className="text-[10px] text-gray-500">minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setWorkDuration(prev => Math.max(1, prev - 1))}
                    className="p-1.5 bg-slate-900 border border-gray-800 rounded-lg hover:text-emerald-400 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold text-white w-6 text-center">{workDuration}</span>
                  <button 
                    onClick={() => setWorkDuration(prev => prev + 1)}
                    className="p-1.5 bg-slate-900 border border-gray-800 rounded-lg hover:text-emerald-400 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Short break input */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Short Break</h4>
                  <span className="text-[10px] text-gray-500">minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShortBreakDuration(prev => Math.max(1, prev - 1))}
                    className="p-1.5 bg-slate-900 border border-gray-800 rounded-lg hover:text-blue-400 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold text-white w-6 text-center">{shortBreakDuration}</span>
                  <button 
                    onClick={() => setShortBreakDuration(prev => prev + 1)}
                    className="p-1.5 bg-slate-900 border border-gray-800 rounded-lg hover:text-blue-400 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Long break input */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Long Break</h4>
                  <span className="text-[10px] text-gray-500">minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setLongBreakDuration(prev => Math.max(1, prev - 1))}
                    className="p-1.5 bg-slate-900 border border-gray-800 rounded-lg hover:text-purple-400 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold text-white w-6 text-center">{longBreakDuration}</span>
                  <button 
                    onClick={() => setLongBreakDuration(prev => prev + 1)}
                    className="p-1.5 bg-slate-900 border border-gray-800 rounded-lg hover:text-purple-400 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-xs cursor-pointer"
            >
              Apply and Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerPage;
