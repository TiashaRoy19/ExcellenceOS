const Flashcard = require('../models/Flashcard');

// @desc    Get all decks for a user
// @route   GET /api/flashcards
// @access  Private
exports.getDecks = async (req, res, next) => {
  try {
    const decks = await Flashcard.listByUser(req.user.id);
    res.json(decks);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a deck
// @route   DELETE /api/flashcards/:id
// @access  Private
exports.deleteDeck = async (req, res, next) => {
  try {
    const deleted = await Flashcard.remove(req.params.id, req.user.id);
    if (!deleted) {
      res.status(404);
      return next(new Error('Deck not found'));
    }
    res.json({ message: 'Deck removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};
