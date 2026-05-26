import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader, 
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';

const Flashcards = () => {
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tab, setTab] = useState('decks'); // decks, create
  const [loading, setLoading] = useState(true);
  
  // Create Deck states
  const [textInput, setTextInput] = useState('');
  const [deckName, setDeckName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState('');

  const fetchDecks = async () => {
    try {
      const res = await axios.get('/api/flashcards');
      setDecks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flashcard decks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
    
    // Check if redirected from notes with a generation query
    const params = new URLSearchParams(window.location.search);
    if (params.get('generate') === 'true') {
      const cachedText = localStorage.getItem('ai_source_text');
      const cachedTitle = localStorage.getItem('ai_source_title');
      if (cachedText) {
        setTextInput(cachedText);
        setDeckName(cachedTitle ? `${cachedTitle} Cards` : 'AI Generated Deck');
        setTab('create');
        localStorage.removeItem('ai_source_text');
        localStorage.removeItem('ai_source_title');
      }
    }
  }, []);

  // Keyboard controls for study mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeDeck) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        handlePrevCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDeck, currentCardIndex, isFlipped]);

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || !deckName.trim()) {
      setError('Please fill in both the deck name and source text.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await axios.post('/api/ai/flashcards', {
        text: textInput,
        deckName
      });
      setDecks([res.data, ...decks]);
      setTextInput('');
      setDeckName('');
      setTab('decks');
      setActiveDeck(res.data);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcard deck.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this flashcard deck permanently?')) return;
    try {
      await axios.delete(`/api/flashcards/${deckId}`);
      setDecks(decks.filter(d => d._id !== deckId));
      if (activeDeck?._id === deckId) {
        setActiveDeck(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete deck.');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (soundEnabled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-500.wav');
        audio.volume = 0.15;
        audio.play();
      } catch (err) {
        // audio play fails silently
      }
    }
  };

  const handleNextCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % activeDeck.cards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + activeDeck.cards.length) % activeDeck.cards.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-8 w-8 text-emerald-400" />
            AI Flashcards
          </h1>
          <p className="text-gray-400 text-sm mt-1">Harness spaced repetition to recall terms, definitions, and equations</p>
        </div>

        {/* Tab Buttons */}
        {!activeDeck && (
          <div className="flex bg-slate-900 border border-gray-850 p-1.5 rounded-xl">
            <button
              onClick={() => setTab('decks')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                tab === 'decks'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Decks
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
              <span>Generate Deck</span>
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

      {/* Main Content Area */}
      {activeDeck ? (
        /* STUDY INTERACTION VIEW */
        <div className="space-y-6 flex flex-col items-center">
          {/* Controls top bar */}
          <div className="flex items-center justify-between w-full border-b border-gray-800/40 pb-4">
            <button
              onClick={() => setActiveDeck(null)}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs font-bold transition cursor-pointer border border-gray-700/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Decks</span>
            </button>

            <span className="text-sm font-extrabold text-white">{activeDeck.deckName}</span>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition border border-gray-700/60 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Interactive Flip Card Component */}
          <div className="w-full max-w-lg mt-6">
            <div 
              onClick={handleFlip}
              className="card-flip-container w-full aspect-[16/10] cursor-pointer"
            >
              <div className={`card-flip-inner w-full h-full relative rounded-3xl transition-transform duration-500 shadow-2xl ${
                isFlipped ? 'card-flipped' : ''
              }`}>
                {/* CARD FRONT */}
                <div className="card-front absolute inset-0 glass-panel border border-emerald-500/20 p-8 flex flex-col items-center justify-center text-center rounded-3xl bg-slate-900/60">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest absolute top-6">Question</span>
                  <p className="text-xl font-bold text-white max-w-sm">
                    {activeDeck.cards[currentCardIndex]?.front}
                  </p>
                  <span className="text-[10px] text-gray-500 absolute bottom-6 font-medium">Click Card to Flip or press SPACE</span>
                </div>

                {/* CARD BACK */}
                <div className="card-back absolute inset-0 glass-panel border border-blue-500/20 p-8 flex flex-col items-center justify-center text-center rounded-3xl bg-slate-950/70">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest absolute top-6">Answer / Definition</span>
                  <p className="text-base text-gray-300 leading-relaxed max-w-sm">
                    {activeDeck.cards[currentCardIndex]?.back}
                  </p>
                  <span className="text-[10px] text-gray-500 absolute bottom-6 font-medium">Click Card to Flip or press SPACE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-6 mt-6 z-10">
            <button
              onClick={handlePrevCard}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl cursor-pointer border border-gray-700/60 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <span className="text-xs font-bold text-gray-400">
              Card {currentCardIndex + 1} of {activeDeck.cards.length}
            </span>

            <button
              onClick={handleNextCard}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl cursor-pointer border border-gray-700/60 transition"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : tab === 'decks' ? (
        /* MY DECKS GRID VIEW */
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>
          ) : decks.length === 0 ? (
            <div className="glass-panel p-16 text-center text-sm text-gray-500 rounded-2xl">
              No flashcard decks found. Generate your first smart deck above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {decks.map(deck => (
                <div
                  key={deck._id}
                  onClick={() => {
                    setActiveDeck(deck);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className="glass-panel p-6 rounded-2xl text-left border border-transparent hover:border-emerald-500/20 hover:bg-slate-850/10 cursor-pointer transition duration-300 flex flex-col justify-between min-h-[140px]"
                >
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-200 truncate">{deck.deckName}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold">{deck.cards.length} flashcards</span>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <button className="flex items-center gap-1 py-1 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition">
                      <Play className="h-3 w-3 fill-emerald-400" />
                      <span>Study</span>
                    </button>

                    <button
                      onClick={(e) => handleDeleteDeck(deck._id, e)}
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
        /* CREATE / AI GENERATION PANEL */
        <div className="glass-panel p-6 rounded-2xl border border-gray-850 max-w-2xl mx-auto">
          <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Generate Flashcard Deck via Gemini AI
          </h3>

          <form onSubmit={handleGenerateDeck} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Deck Name</label>
              <input
                type="text"
                placeholder="Math Formulas, Biology Chapter 1..."
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Source Material</label>
              <textarea
                placeholder="Paste the paragraphs, definitions, or study notes from which the AI should extract study terms and answers..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-56 px-4 py-3 rounded-xl glass-input text-gray-200 placeholder-gray-600 text-sm resize-none leading-relaxed outline-none"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTab('decks')}
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
                <span>Generate Smart Deck</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
