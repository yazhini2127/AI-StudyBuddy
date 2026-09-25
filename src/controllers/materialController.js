const { generateStudyMaterialSummary } = require('../services/aiService');const { generateSummary } = require('../services/aiService');

const summarizeMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await StudyMaterial.findOne({
      _id: id,
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
        message: 'This study material does not contain text content to summarize'
      });
    }

    const summary = await generateStudyMaterialSummary(
      material.title,
      material.content,
      material.subject
    );

    return res.json({
      success: true,
      message: 'Study material summarized successfully',
      data: {
        materialId: material._id,
        title: material.title,
        subject: material.subject,
        summary
      }
    });
  } catch (error) {
    console.error('Summarize material error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error while generating summary'
    });
  }
};

module.exports = {
  summarizeMaterial
};