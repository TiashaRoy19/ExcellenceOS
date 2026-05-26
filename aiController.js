const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const { parsePdfBuffer } = require('../utils/pdfParser');
const { summarizeText, generateFlashcardsAI, generateQuizAI } = require('../utils/geminiHelper');
const { logActivity } = require('../utils/analyticsHelper');

// @desc    Parse PDF base64 file to raw text
// @route   POST /api/ai/parse-pdf
// @access  Private
exports.parsePdf = async (req, res, next) => {
  const { pdfBase64 } = req.body;

  try {
    if (!pdfBase64) {
      res.status(400);
      return next(new Error('Please provide PDF base64 string'));
    }

    const buffer = Buffer.from(pdfBase64, 'base64');
    const parsedText = await parsePdfBuffer(buffer);

    res.json({ text: parsedText });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate markdown summary using AI
// @route   POST /api/ai/summarize
// @access  Private
exports.getAISummary = async (req, res, next) => {
  const { text } = req.body;

  try {
    if (!text || text.trim() === '') {
      res.status(400);
      return next(new Error('Please provide study text to summarize'));
    }

    const summary = await summarizeText(text);

    // Track AI activity in analytics
    await logActivity(req.user.id, { aiGenerationsCount: 1 });

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate study flashcards from text and save deck
// @route   POST /api/ai/flashcards
// @access  Private
exports.getAIFlashcards = async (req, res, next) => {
  const { text, deckName } = req.body;

  try {
    if (!text || text.trim() === '') {
      res.status(400);
      return next(new Error('Please provide study text to generate cards'));
    }

    const cards = await generateFlashcardsAI(text);
    
    // Save generated cards to database
    const newDeck = await Flashcard.create({
      userId: req.user.id,
      deckName: deckName || 'AI Generated Deck',
      cards
    });

    // Track AI activity in analytics
    await logActivity(req.user.id, { aiGenerationsCount: 1 });

    res.status(201).json(newDeck);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate interactive quiz questions and save quiz
// @route   POST /api/ai/quiz
// @access  Private
exports.getAIQuiz = async (req, res, next) => {
  const { text, title, difficulty } = req.body;

  try {
    if (!text || text.trim() === '') {
      res.status(400);
      return next(new Error('Please provide study text to generate quiz'));
    }

    const questions = await generateQuizAI(text, difficulty || 'medium');

    // Save generated quiz to database
    const newQuiz = await Quiz.create({
      userId: req.user.id,
      title: title || 'AI Practice Quiz',
      difficulty: difficulty || 'medium',
      questions,
      maxScore: questions.length,
      score: 0,
      taken: false
    });

    // Track AI activity in analytics
    await logActivity(req.user.id, { aiGenerationsCount: 1 });

    res.status(201).json(newQuiz);
  } catch (error) {
    next(error);
  }
};
