// const express = require('express');
// const multer = require('multer');
// const Audio = require('../models/Audio'); // Import the model
// const router = express.Router();

// // Configure multer for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // POST route to upload audio
// router.post('/upload', upload.single('audio'), async (req, res) => {
//     try {
//         const { originalname, mimetype, buffer } = req.file;

//         // Save the audio file to MongoDB
//         const audio = new Audio({
//             filename: originalname,
//             contentType: mimetype,
//             data: buffer,
//         });

//         await audio.save();

//         res.status(200).json({ message: 'Audio uploaded successfully', audioId: audio._id });
//     } catch (error) {
//         console.error('Error saving audio:', error);
//         res.status(500).json({ error: 'Failed to upload audio' });
//     }
// });

// module.exports = router;


const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AudioRecording = require('../models/Audio');
const authMiddleware = require('../middleware/verifyToken');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `recording-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Upload Audio Route
router.post('/upload', 
  authMiddleware,
  upload.single('audio'), 
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
      }

      // Create audio recording record
      const audioRecording = new AudioRecording({
        user: req.user._id, // Ensure the user field is set
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      await audioRecording.save();

      res.status(201).json({ 
        message: 'Audio uploaded successfully',
        audioId: audioRecording._id
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      res.status(500).json({ message: 'Server error during audio upload' });
    }
});


// Get User's Audio Recordings
router.get('/recordings', authMiddleware, async (req, res) => {
  try {
    const recordings = await AudioRecording.find({ user: req.user._id })
      .sort({ uploadedAt: -1 });

    res.json(recordings);
  } catch (error) {
    console.error('Fetch recordings error:', error);
    res.status(500).json({ message: 'Server error fetching recordings' });
  }
});

module.exports = router;