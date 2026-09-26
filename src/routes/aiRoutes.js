const express = require('express');

const router = express.Router();

const {
  getWeatherSummary,
  getWeatherRecommendation,
  getFlashcards,
  getQuiz,
  getStudyPlan
} = require('../controllers/aiController');

const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

// Weather AI
router.post('/weather-summary', getWeatherSummary);
router.post('/weather-recommendation', getWeatherRecommendation);

// Study AI
router.post('/flashcards', getFlashcards);
router.post('/quiz', getQuiz);
router.post('/study-plan', getStudyPlan);

module.exports = router;