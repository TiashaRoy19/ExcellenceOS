const express = require('express');
const router = express.Router();
const { parsePdf, getAISummary, getAIFlashcards, getAIQuiz } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/parse-pdf', parsePdf);
router.post('/summarize', getAISummary);
router.post('/flashcards', getAIFlashcards);
router.post('/quiz', getAIQuiz);

module.exports = router;
