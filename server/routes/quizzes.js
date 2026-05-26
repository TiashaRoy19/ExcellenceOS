const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizById, submitQuizScore, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getQuizzes);

router.route('/:id')
  .get(getQuizById)
  .delete(deleteQuiz);

router.route('/:id/score')
  .put(submitQuizScore);

module.exports = router;
