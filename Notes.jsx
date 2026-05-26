import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Folder, 
  Search, 
  BookOpen, 
  Eye, 
  Edit3, 
  Save, 
  BrainCircuit, 
  Layers, 
  FileQuestion,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Note editor states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteFolder, setNoteFolder] = useState('General');
  
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');

  // Fetch all notes
  const fetchNotes = async (selectFirst = false) => {
    try {
      const res = await axios.get('/api/notes');
      setNotes(res.data);
      if (res.data.length > 0 && (selectFirst || !selectedNote)) {
        handleSelectNote(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Could not load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(true);
  }, []);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteFolder(note.folder);
    setIsEditing(true);
    setSaveStatus('');
  };

  const handleCreateNote = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/notes', {
        title: 'Untitled Note',
        content: '',
        folder: selectedFolder !== 'All' ? selectedFolder : 'General'
      });
      setNotes([res.data, ...notes]);
      handleSelectNote(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to create a new note.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    setSaveStatus('Saving...');
    try {
      const res = await axios.put(`/api/notes/${selectedNote._id}`, {
        title: noteTitle,
        content: noteContent,
        folder: noteFolder
      });
      // Update local notes array
      const updatedNotes = notes.map(n => n._id === selectedNote._id ? res.data : n);
      setNotes(updatedNotes);
      setSelectedNote(res.data);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`/api/notes/${noteId}`);
      const remainingNotes = notes.filter(n => n._id !== noteId);
      setNotes(remainingNotes);
      if (selectedNote?._id === noteId) {
        if (remainingNotes.length > 0) {
          handleSelectNote(remainingNotes[0]);
        } else {
          setSelectedNote(null);
          setNoteTitle('');
          setNoteContent('');
          setNoteFolder('General');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete the note.');
    }
  };

  // Quick Action Redirects/Triggers for AI
  const handleAISummarize = () => {
    if (!noteContent.trim()) {
      alert('Add some content to your note first!');
      return;
    }
    // Store content temporarily in localStorage so the AI page can load it
    localStorage.setItem('ai_source_text', noteContent);
    localStorage.setItem('ai_source_title', noteTitle);
    window.location.href = '/ai';
  };

  const handleAICreateCards = () => {
    if (!noteContent.trim()) {
      alert('Add some content to your note first!');
      return;
    }
    localStorage.setItem('ai_source_text', noteContent);
    localStorage.setItem('ai_source_title', noteTitle);
    window.location.href = '/flashcards?generate=true';
  };

  const handleAICreateQuiz = () => {
    if (!noteContent.trim()) {
      alert('Add some content to your note first!');
      return;
    }
    localStorage.setItem('ai_source_text', noteContent);
    localStorage.setItem('ai_source_title', noteTitle);
    window.location.href = '/quizzes?generate=true';
  };

  // Filter notes based on folder and search query
  const folders = ['All', ...new Set(notes.map(n => n.folder).filter(Boolean))];

  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'All' || note.folder === selectedFolder;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            Smart Notes
          </h1>
          <p className="text-gray-400 text-sm mt-1">Organize your thoughts, code snippets, and study material</p>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-black font-semibold rounded-xl transition duration-200 cursor-pointer text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-200 p-3 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="h-10 w-10 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Left Notes List Sidebar */}
          <div className="w-80 flex flex-col gap-4 shrink-0">
            {/* Search and Folder filter */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input text-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {folders.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 cursor-pointer ${
                      selectedFolder === f
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-900/40 text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Cards List */}
            <div className="flex-1 overflow-y-auto glass-panel p-3 rounded-2xl space-y-2">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No notes found
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note._id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-3.5 rounded-xl cursor-pointer transition border text-left ${
                      selectedNote?._id === note._id
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-transparent border-transparent hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-semibold text-sm text-gray-200 truncate flex-1">{note.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                        className="text-gray-500 hover:text-red-400 p-0.5 rounded transition shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {note.content || 'Empty note...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                        <Folder className="h-2.5 w-2.5" />
                        {note.folder}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Note Editor / View Area */}
          <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
            {selectedNote ? (
              <>
                {/* Editor Header / Controls */}
                <div className="p-4 border-b border-gray-800/60 bg-slate-900/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer border border-gray-700/60"
                    >
                      {isEditing ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSaveNote}
                      disabled={saving}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {saving ? (
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span>Save</span>
                    </button>
                    {saveStatus && (
                      <span className="text-xs text-emerald-400 font-semibold animate-pulse">{saveStatus}</span>
                    )}
                  </div>

                  {/* AI Integration Toolbar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAISummarize}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 rounded-lg text-[10px] font-bold cursor-pointer transition"
                      title="Generate summary using Gemini AI"
                    >
                      <BrainCircuit className="h-3.5 w-3.5" />
                      <span>AI Summarize</span>
                    </button>
                    <button
                      onClick={handleAICreateCards}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold cursor-pointer transition"
                      title="Create study cards using Gemini AI"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>AI Flashcards</span>
                    </button>
                    <button
                      onClick={handleAICreateQuiz}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 rounded-lg text-[10px] font-bold cursor-pointer transition"
                      title="Generate interactive quiz using Gemini AI"
                    >
                      <FileQuestion className="h-3.5 w-3.5" />
                      <span>AI Quiz</span>
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
                  {/* Note Title & Folder input row */}
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note Title"
                      className="text-2xl font-extrabold text-white bg-transparent border-b border-transparent focus:border-gray-800 pb-1 flex-1 outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-semibold">Folder:</span>
                      <input
                        type="text"
                        value={noteFolder}
                        onChange={(e) => setNoteFolder(e.target.value)}
                        placeholder="General"
                        className="bg-slate-900/60 border border-gray-800 text-xs rounded-lg px-2.5 py-1 text-emerald-400 font-semibold w-28 text-center outline-none focus:border-emerald-500/30"
                      />
                    </div>
                  </div>

                  {/* Body Editor or Rendered View */}
                  {isEditing ? (
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write your note contents here... Supports Markdown style documentation."
                      className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 text-sm outline-none resize-none font-mono leading-relaxed"
                    />
                  ) : (
                    <div className="flex-1 text-sm text-gray-300 leading-relaxed font-sans select-text whitespace-pre-wrap">
                      {noteContent || (
                        <span className="text-gray-600 italic">No content in note yet. Toggle edit mode above to start writing.</span>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 p-8">
                <BookOpen className="h-12 w-12 text-gray-700" />
                <div className="text-sm">Select a note from the sidebar or create a new one to begin</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
