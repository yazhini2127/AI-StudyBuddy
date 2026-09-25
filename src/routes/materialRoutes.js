const express = require('express');
const multer = require('multer');

const StudyMaterial = require('../models/StudyMaterial');
const { protect } = require('../middleware/authMiddleware');
const { summarizeMaterial } = require('../controllers/materialController');
const router = express.Router();

const upload = multer({
  dest: 'uploads/'
});

// Add study material as text
router.post('/', protect, async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, subject, and content'
      });
    }

    const material = await StudyMaterial.create({
      userId: req.user.id,
      title,
      subject,
      content
    });

    res.status(201).json({
      success: true,
      message: 'Study material created successfully',
      data: material
    });
  } catch (error) {
    console.error('Create material error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while creating study material'
    });
  }
});

// Upload study material file
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject } = req.body;

    if (!title || !subject || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, subject, and file'
      });
    }

    const material = await StudyMaterial.create({
      userId: req.user.id,
      title,
      subject,
      content: '',
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: material
    });
  } catch (error) {
    console.error('Upload material error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while uploading study material'
    });
  }
});
// Generate AI summary for a study material
router.post('/:id/summarize', protect, summarizeMaterial);
// Get logged-in user's study materials
router.get('/', protect, async (req, res) => {
  try {
    const materials = await StudyMaterial.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Get materials error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching study materials'
    });
  }
});

module.exports = router;