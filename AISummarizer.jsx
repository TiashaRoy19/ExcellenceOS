import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BrainCircuit, 
  Upload, 
  FileText, 
  Sparkles, 
  Loader,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

const AISummarizer = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Load content sent from the notes page
  useEffect(() => {
    const cachedText = localStorage.getItem('ai_source_text');
    const cachedTitle = localStorage.getItem('ai_source_title');
    if (cachedText) {
      setText(cachedText);
      localStorage.removeItem('ai_source_text');
      localStorage.removeItem('ai_source_title');
      
      // Auto-summarize if redirected with text
      triggerSummarize(cachedText);
    }
  }, []);

  const triggerSummarize = async (textToSummarize) => {
    const rawText = textToSummarize || text;
    if (!rawText.trim()) {
      setError('Please provide text or upload a PDF first.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await axios.post('/api/ai/summarize', { text: rawText });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF documents are supported.');
      return;
    }

    setPdfLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(',')[1];
        const res = await axios.post('/api/ai/parse-pdf', { pdfBase64: base64String });
        setText(res.data.text);
      } catch (err) {
        console.error(err);
        setError('Failed to extract text from PDF.');
      } finally {
        setPdfLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading PDF file.');
      setPdfLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-emerald-400" />
          AI Study Summarizer
        </h1>
        <p className="text-gray-400 text-sm mt-1">Convert dense notes or lecture PDFs into structured, readable digests</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Input Panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-gray-850">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Source Material</h3>
            
            {/* PDF Uploader */}
            <label className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900/60 hover:bg-slate-900 border border-gray-850 hover:border-gray-800 text-emerald-400 font-bold rounded-lg text-[10px] cursor-pointer transition">
              {pdfLoading ? (
                <Loader className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span>Upload Lecture PDF</span>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handlePdfUpload} 
                className="hidden" 
                disabled={pdfLoading}
              />
            </label>
          </div>

          <textarea
            placeholder="Paste your study materials, lecture transcripts, or articles here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-80 px-4 py-3 rounded-xl glass-input text-gray-200 placeholder-gray-600 text-sm resize-none leading-relaxed outline-none"
          />

          <button
            onClick={() => triggerSummarize()}
            disabled={loading || pdfLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-500/50 text-black font-extrabold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 fill-black" />
            )}
            <span>Generate AI Summary</span>
          </button>
        </div>

        {/* Right Column: AI Output */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-[460px] max-h-[520px] overflow-hidden border border-gray-850">
          <div className="p-4 border-b border-gray-800/60 bg-slate-900/15 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-emerald-400" />
              AI Summary Digest
            </h3>

            {summary && (
              <button
                onClick={handleCopy}
                className="p-1.5 bg-slate-800 hover:bg-slate-750 text-gray-300 hover:text-white rounded-lg transition cursor-pointer border border-gray-700/60"
                title="Copy Summary to Clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto select-text prose prose-invert max-w-none text-left">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <Loader className="h-8 w-8 text-emerald-400 animate-spin" />
                <span className="text-xs font-semibold">Gemini is processing your request...</span>
              </div>
            ) : summary ? (
              <div className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">
                {summary}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs italic text-center py-20">
                Your AI-generated summaries will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummarizer;
