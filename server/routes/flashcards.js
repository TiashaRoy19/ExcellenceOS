const express = require('express');
const router = express.Router();
const { getDecks, deleteDeck } = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDecks);

router.route('/:id')
  .delete(deleteDeck);

module.exports = router;
