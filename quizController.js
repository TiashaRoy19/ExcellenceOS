const Quiz = require('../models/Quiz');

// @desc    Get all quizzes for a user
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.listByUser(req.user.id);
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdForUser(req.params.id, req.user.id);
    if (!quiz) {
      res.status(404);
      return next(new Error('Quiz not found'));
    }
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit score for a quiz
// @route   PUT /api/quizzes/:id/score
// @access  Private
exports.submitQuizScore = async (req, res, next) => {
  const { score } = req.body;

  try {
    const quiz = await Quiz.findByIdForUser(req.params.id, req.user.id);
    if (!quiz) {
      res.status(404);
      return next(new Error('Quiz not found'));
    }

    const updatedQuiz = await Quiz.updateScore(req.params.id, req.user.id, Number(score) || 0);

    res.json(updatedQuiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
exports.deleteQuiz = async (req, res, next) => {
  try {
    const deleted = await Quiz.remove(req.params.id, req.user.id);
    if (!deleted) {
      res.status(404);
      return next(new Error('Quiz not found'));
    }
    res.json({ message: 'Quiz removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};
