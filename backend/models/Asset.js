const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  creatorName: {
    type: String,
    required: [true, 'Creator name is required'],
    trim: true,
  },
  assetHash: {
    type: String,
    required: [true, 'Asset hash is required'],
    unique: true,
  },
  originalFileName: {
    type: String,
    trim: true,
  },
  fileSize: {
    type: Number,
  },
  mimeType: {
    type: String,
  },
  geminiAnalysis: {
    type: String,
    default: 'Analysis pending...',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Minted', 'Verified', 'Disputed', 'Revoked'],
    default: 'Minted',
  },
});

// Index for fast creator lookups
assetSchema.index({ creatorName: 1 });

module.exports = mongoose.model('Asset', assetSchema);
