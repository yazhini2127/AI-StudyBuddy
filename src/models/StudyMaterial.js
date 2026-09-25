const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    fileName: {
      type: String,
      default: null
    },

    filePath: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);