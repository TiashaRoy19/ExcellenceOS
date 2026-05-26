import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileQuestion, 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader, 
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Interactive Quiz Taking States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Tab & Form States
  const [tab, setTab] = useState('quizzes'); // quizzes, create
  const [textInput, setTextInput] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('/api/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();

    // Check if redirected from notes with a generation query
    const params = new URLSearchParams(window.location.search);
    if (params.get('generate') === 'true') {
      const cachedText = localStorage.getItem('ai_source_text');
      const cachedTitle = localStorage.getItem('ai_source_title');
      if (cachedText) {
        setTextInput(cachedText);
        setQuizTitle(cachedTitle ? `${cachedTitle} Quiz` : 'AI Generated Quiz');
        setTab('create');
        localStorage.removeItem('ai_source_text');
        localStorage.removeItem('ai_source_title');
      }
    }
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || !quizTitle.trim()) {
      setError('Please fill in both the quiz title and source text.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await axios.post('/api/ai/quiz', {
        text: textInput,
        title: quizTitle,
        difficulty
      });
      setQuizzes([res.data, ...quizzes]);
      setTextInput('');
      setQuizTitle('');
      setTab('quizzes');
      
      // Auto open quiz for taking
      startQuizTaking(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const startQuizTaking = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShortAnswerInput('');
    setAnswerSubmitted(false);
    setQuizScore(0);
    setQuizComplete(false);
  };

  const handleSubmitAnswer = () => {
    if (answerSubmitted) return;

    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    let isCorrect = false;

    if (currentQuestion.type === 'short') {
      const cleanUserAns = shortAnswerInput.trim().toLowerCase();
      const cleanCorrectAns = currentQuestion.correctAnswer.trim().toLowerCase();
      isCorrect = cleanUserAns === cleanCorrectAns || cleanCorrectAns.includes(cleanUserAns) && cleanUserAns.length > 2;
    } else {
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    }

    setIsAnswerCorrect(isCorrect);
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
    setAnswerSubmitted(true);
  };

  const handleNextQuestion = async () => {
    const isLastQuestion = currentQuestionIndex === activeQuiz.questions.length - 1;

    if (isLastQuestion) {
      // Calculate final score
      const finalScore = isAnswerCorrect ? quizScore + 1 : quizScore;
      
      // Submit score to database
      try {
        await axios.put(`/api/quizzes/${activeQuiz._id}/score`, {
          score: finalScore
        });
        
        // Fetch updated lists
        fetchQuizzes();
      } catch (err) {
        console.error('Error submitting quiz score:', err);
      }
      
      setQuizComplete(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer('');
      setShortAnswerInput('');
      setAnswerSubmitted(false);
    }
  };

  const handleDeleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this quiz permanently?')) return;
    try {
      await axios.delete(`/api/quizzes/${quizId}`);
      setQuizzes(quizzes.filter(q => q._id !== quizId));
      if (activeQuiz?._id === quizId) {
        setActiveQuiz(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete quiz.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FileQuestion className="h-8 w-8 text-emerald-400" />
            AI Quizzes
          </h1>
          <p className="text-gray-400 text-sm mt-1">Test your recall accuracy with MCQs, True/False, and direct short questions</p>
        </div>

        {/* Tab Buttons */}
        {!activeQuiz && (
          <div className="flex bg-slate-900 border border-gray-850 p-1.5 rounded-xl">
            <button
              onClick={() => setTab('quizzes')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                tab === 'quizzes'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Quizzes
            </button>
            <button
              onClick={() => setTab('create')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1 ${
                tab === 'create'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate Quiz</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      {activeQuiz ? (
        /* QUIZ TAKING VIEW */
        <div className="glass-panel p-8 rounded-3xl border border-gray-850 shadow-2xl space-y-6 text-left">
          {quizComplete ? (
            /* COMPLETION VIEW */
            <div className="text-center py-10 space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit mx-auto">
                <Award className="h-12 w-12 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
                <p className="text-gray-400 text-sm">{activeQuiz.title}</p>
              </div>

              <div className="max-w-xs mx-auto p-4 bg-slate-900/60 border border-gray-800 rounded-2xl">
                <span className="text-gray-500 text-xs uppercase font-bold tracking-widest block">Final Score</span>
                <span className="text-4xl font-black text-emerald-400">{quizScore}</span>
                <span className="text-gray-400 text-sm"> / {activeQuiz.questions.length}</span>
              </div>

              <button
                onClick={() => setActiveQuiz(null)}
                className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Return to Quizzes
              </button>
            </div>
          ) : (
            /* ACTIVE QUESTION VIEW */
            <>
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <button
                  onClick={() => {
                    if (window.confirm('Abandon this quiz session? Progress will not be saved.')) {
                      setActiveQuiz(null);
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Abandon Quiz</span>
                </button>

                <span className="text-xs font-bold text-gray-500 uppercase">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                  {activeQuiz.questions[currentQuestionIndex].type === 'mcq' ? 'Multiple Choice' :
                   activeQuiz.questions[currentQuestionIndex].type === 'tf' ? 'True / False' : 'Short Answer'}
                </span>
                <h2 className="text-lg font-bold text-gray-100 leading-snug">
                  {activeQuiz.questions[currentQuestionIndex].questionText}
                </h2>
              </div>

              {/* Input Forms based on type */}
              <div className="space-y-3 pt-2">
                {activeQuiz.questions[currentQuestionIndex].type === 'short' ? (
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={shortAnswerInput}
                    onChange={(e) => setShortAnswerInput(e.target.value)}
                    disabled={answerSubmitted}
                    className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm"
                  />
                ) : (
                  activeQuiz.questions[currentQuestionIndex].options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === activeQuiz.questions[currentQuestionIndex].correctAnswer;
                    
                    let borderClass = 'border-gray-800 hover:border-gray-700 hover:bg-slate-800/20';
                    let textClass = 'text-gray-300';
                    
                    if (answerSubmitted) {
                      if (isCorrect) {
                        borderClass = 'border-emerald-500 bg-emerald-500/5';
                        textClass = 'text-emerald-400 font-bold';
                      } else if (isSelected) {
                        borderClass = 'border-red-500 bg-red-500/5';
                        textClass = 'text-red-400';
                      } else {
                        borderClass = 'border-gray-850 opacity-40';
                      }
                    } else if (isSelected) {
                      borderClass = 'border-emerald-500/60 bg-emerald-500/5';
                      textClass = 'text-emerald-400 font-bold';
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => setSelectedAnswer(option)}
                        disabled={answerSubmitted}
                        className={`w-full p-4 rounded-xl text-left border text-xs font-semibold transition ${borderClass} ${textClass} ${
                          !answerSubmitted ? 'cursor-pointer' : ''
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Instant Feedback Panel */}
              {answerSubmitted && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  isAnswerCorrect 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                    : 'bg-red-500/5 border-red-500/20 text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isAnswerCorrect ? (
                      <>
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4.5 w-4.5 text-red-400" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                  <p>
                    <span className="font-semibold text-gray-300 block mb-1">Correct Answer:</span>
                    <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-gray-850">{activeQuiz.questions[currentQuestionIndex].correctAnswer}</span>
                  </p>
                  {activeQuiz.questions[currentQuestionIndex].explanation && (
                    <p className="text-gray-400 mt-1">
                      <span className="font-semibold text-gray-300 block mb-1">Explanation:</span>
                      {activeQuiz.questions[currentQuestionIndex].explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Button Controls */}
              <div className="pt-4 flex justify-end">
                {!answerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={activeQuiz.questions[currentQuestionIndex].type === 'short' ? !shortAnswerInput.trim() : !selectedAnswer}
                    className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="py-2.5 px-6 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 border border-gray-700/60"
                  >
                    <span>
                      {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : tab === 'quizzes' ? (
        /* QUIZ GRID LIST VIEW */
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="glass-panel p-16 text-center text-sm text-gray-500 rounded-2xl">
              No quizzes generated yet. Fill in text and create one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quizzes.map(quiz => (
                <div
                  key={quiz._id}
                  onClick={() => startQuizTaking(quiz)}
                  className="glass-panel p-6 rounded-2xl text-left border border-transparent hover:border-emerald-500/20 hover:bg-slate-850/10 cursor-pointer transition duration-300 flex flex-col justify-between min-h-[140px]"
                >
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-gray-200 truncate">{quiz.title}</h3>
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        quiz.difficulty === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/15' :
                        quiz.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                      }`}>
                        {quiz.difficulty}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{quiz.questions.length} questions</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    {quiz.taken ? (
                      <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-slate-900 border border-gray-850 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Scored: {quiz.score}/{quiz.maxScore}</span>
                      </div>
                    ) : (
                      <button className="flex items-center gap-1 py-1 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition">
                        <Play className="h-3 w-3 fill-emerald-400" />
                        <span>Take Quiz</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteQuiz(quiz._id, e)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* GENERATION INPUT PANEL */
        <div className="glass-panel p-6 rounded-2xl border border-gray-850 max-w-2xl mx-auto">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Generate Quiz via Gemini AI
          </h3>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Quiz Title</label>
                <input
                  type="text"
                  placeholder="History Quiz, JavaScript Trivia..."
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-white text-xs bg-slate-950 font-semibold"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Source Material</label>
              <textarea
                placeholder="Paste the notes or article from which the quiz questions should be derived..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-56 px-4 py-3 rounded-xl glass-input text-gray-200 placeholder-gray-600 text-sm resize-none leading-relaxed outline-none"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTab('quizzes')}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-gray-300 font-bold rounded-xl text-xs transition cursor-pointer border border-gray-700/60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={generating}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-extrabold rounded-xl transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {generating ? (
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 fill-black" />
                )}
                <span>Generate Smart Quiz</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
