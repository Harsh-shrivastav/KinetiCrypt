require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Asset = require('./models/Asset');

// ─── Config ────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kineticrypt';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️  GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

// ─── Middleware ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Multer — memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// ─── Gemini Client ──────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Routes ─────────────────────────────────────────────────────────

/**
 * POST /api/mint
 * Accepts multipart form data: image file + creatorName
 * → Hashes file, analyzes with Gemini, saves to MongoDB
 */
app.post('/api/mint', upload.single('image'), async (req, res) => {
  try {
    const { creatorName } = req.body;
    const file = req.file;

    if (!creatorName || !file) {
      return res.status(400).json({
        error: 'Both creatorName and an image file are required.',
      });
    }

    // 1. Generate SHA-256 hash of the file buffer
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 2. Check for duplicate hash (asset already minted)
    const existing = await Asset.findOne({ assetHash: hash });
    if (existing) {
      return res.status(409).json({
        error: 'This exact asset has already been minted.',
        existingId: existing._id,
        mintedBy: existing.creatorName,
        mintedAt: existing.timestamp,
      });
    }

    // 3. Analyze with Gemini 1.5 Flash
    let geminiAnalysis = 'Analysis unavailable.';
    try {
      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const prompt =
        'Analyze this digital asset and describe: 1. Key visual elements 2. Style and theme 3. Unique identifying characteristics. Return concise bullet points.';

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      geminiAnalysis = response.text();
    } catch (aiError) {
      console.error('Gemini analysis failed:', aiError.message);
      geminiAnalysis = 'AI analysis could not be completed. The cryptographic hash remains valid for provenance verification.';
    }

    // 4. Save to MongoDB
    const asset = new Asset({
      creatorName: creatorName.trim(),
      assetHash: hash,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      geminiAnalysis,
    });

    await asset.save();

    console.log(`✅ Asset minted: ${asset._id} by ${creatorName}`);

    return res.status(201).json({
      success: true,
      id: asset._id,
      hash: asset.assetHash,
      status: asset.status,
    });
  } catch (err) {
    console.error('Mint error:', err);
    return res.status(500).json({ error: 'Internal server error during minting.' });
  }
});

/**
 * POST /api/verify
 * Accepts multipart form data: image file
 * → Hashes file and checks if it exists in MongoDB
 */
app.post('/api/verify', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'An image file is required for verification.',
      });
    }

    // Generate SHA-256 hash of the file buffer
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Query MongoDB Asset model to see if an asset with this assetHash already exists
    const existing = await Asset.findOne({ assetHash: hash });

    if (existing) {
      return res.status(200).json({
        matchFound: true,
        status: 'Duplicate',
        assetId: existing._id,
      });
    } else {
      return res.status(200).json({
        matchFound: false,
        status: 'Not Found',
      });
    }
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Internal server error during verification.' });
  }
});

/**
 * GET /api/certificate/:id
 * Fetches the full asset record for certificate display
 */
app.get('/api/certificate/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid certificate ID format.' });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ error: 'Certificate not found.' });
    }

    return res.json({
      id: asset._id,
      creatorName: asset.creatorName,
      assetHash: asset.assetHash,
      originalFileName: asset.originalFileName,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
      geminiAnalysis: asset.geminiAnalysis,
      timestamp: asset.timestamp,
      status: asset.status,
    });
  } catch (err) {
    console.error('Certificate fetch error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /api/assets
 * Lists all minted assets (most recent first)
 */
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .select('creatorName assetHash originalFileName timestamp status');
    return res.json(assets);
  } catch (err) {
    console.error('Assets list error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Health Check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'KinetiCrypt Provenance Engine' });
});

// ─── Connect & Start ────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('📦 Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 KinetiCrypt API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
