const {
  generateSummary,
  generateRecommendation,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan
} = require('../services/aiService');

const StudyMaterial = require('../models/StudyMaterial');


// ==============================
// Weather Summary
// ==============================
const getWeatherSummary = async (req, res) => {
  try {
    const { city, temperature, humidity, condition } = req.body;

    if (
      !city ||
      temperature === undefined ||
      humidity === undefined ||
      !condition
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all fields: city, temperature, humidity, and condition'
      });
    }

    const summary = await generateSummary(
      city,
      Number(temperature),
      Number(humidity),
      condition
    );

    return res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in getWeatherSummary:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error while generating weather summary'
    });
  }
};


// ==============================
// Weather Recommendation
// ==============================
const getWeatherRecommendation = async (req, res) => {
  try {
    const { temperature, condition } = req.body;

    if (temperature === undefined || !condition) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all fields: temperature and condition'
      });
    }

    const recommendation = await generateRecommendation(
      Number(temperature),
      condition
    );

    return res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    console.error(
      'Error in getWeatherRecommendation:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        'Server error while generating weather recommendations'
    });
  }
};


// ==============================
// Generate AI Flashcards
// POST /api/ai/flashcards
// ==============================
const getFlashcards = async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide materialId'
      });
    }

    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: req.user.id
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    if (!material.content || material.content.trim() === '') {
      return res.status(400).json({
        success: false,
        message:
          'This study material does not contain text content'
      });
    }

    const flashcards = await generateFlashcards(
      material.title,
      material.subject,
      material.content
    );

    return res.json({
      success: true,
      message: 'Flashcards generated successfully',
      data: {
        materialId: material._id,
        title: material.title,
        subject: material.subject,
        flashcards
      }
    });
  } catch (error) {
    console.error(
      'Error in getFlashcards:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        'Server error while generating flashcards'
    });
  }
};


// ==============================
// Generate AI Quiz
// POST /api/ai/quiz
// ==============================
const getQuiz = async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide materialId'
      });
    }

    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: req.user.id
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    if (!material.content || material.content.trim() === '') {
      return res.status(400).json({
        success: false,
        message:
          'This study material does not contain text content'
      });
    }

    const quiz = await generateQuiz(
      material.title,
      material.subject,
      material.content
    );

    return res.json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        materialId: material._id,
        title: material.title,
        subject: material.subject,
        quiz
      }
    });
  } catch (error) {
    console.error(
      'Error in getQuiz:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        'Server error while generating quiz'
    });
  }
};


// ==============================
// Generate AI Study Plan
// POST /api/ai/study-plan
// ==============================
const getStudyPlan = async (req, res) => {
  try {
    const { subject, topics, days } = req.body;

    if (
      !subject ||
      !Array.isArray(topics) ||
      topics.length === 0 ||
      !days
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide subject, topics array, and days'
      });
    }

    const studyPlan = await generateStudyPlan(
      subject,
      topics,
      Number(days)
    );

    return res.json({
      success: true,
      message: 'Study plan generated successfully',
      data: {
        subject,
        days: Number(days),
        studyPlan
      }
    });
  } catch (error) {
    console.error(
      'Error in getStudyPlan:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        'Server error while generating study plan'
    });
  }
};


// ==============================
// Exports
// ==============================
module.exports = {
  getWeatherSummary,
  getWeatherRecommendation,
  getFlashcards,
  getQuiz,
  getStudyPlan
};