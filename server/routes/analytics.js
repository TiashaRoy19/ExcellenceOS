const express = require('express');
const router = express.Router();
const { logStudySession, getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/log', logStudySession);
router.get('/stats', getAnalytics);

module.exports = router;
