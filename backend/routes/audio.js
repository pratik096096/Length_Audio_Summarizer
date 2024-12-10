

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const AudioRecording = require('../models/Audio');
const authMiddleware = require('../middleware/verifyToken');

const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!req.user || !req.user._id) {
        console.error('Unauthorized: Missing user ID');
        return cb(new Error('User not authenticated'));
      }
  
      console.log('req.user._id:', req.user._id, 'Type:', typeof req.user._id);
  
      // Convert to string if necessary
      const userId = typeof req.user._id === 'object' ? req.user._id.toString() : req.user._id;
      const uploadDir = path.join(__dirname, '../uploads', userId);
  
      await fs.mkdir(uploadDir, { recursive: true }).catch(err => {
        console.error('Error creating upload directory:', err.message);
        cb(new Error('Could not create upload directory'));
      });
  
      cb(null, uploadDir);
    } catch (error) {
      console.error('Directory creation error:', error.message);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/webm', 
      'audio/wav', 
      'audio/mp3', 
      'audio/mpeg',
      'audio/ogg',
      'audio/x-m4a',
      'audio/aac'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.warn('Invalid file type:', file.mimetype);
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

router.post(
  '/upload',
  authMiddleware,
  (req, res, next) => {
    upload.single('audio')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
      } else if (err) {
        return res.status(500).json({ message: 'Upload failed', error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
      }

      const maxFileSize = 50 * 1024 * 1024;
      if (req.file.size > maxFileSize) {
        console.warn('Oversized file detected:', req.file.originalname);
        await fs.unlink(req.file.path);
        return res.status(400).json({
          message: 'File too large',
          maxSize: `${maxFileSize / (1024 * 1024)}MB`,
        });
      }

      const audioRecording = new AudioRecording({
        user: req.user._id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      const savedRecording = await audioRecording.save();

      console.log('File uploaded successfully:', savedRecording);
      res.status(201).json({
        message: 'Audio uploaded successfully',
        audioId: savedRecording._id,
        filename: savedRecording.filename,
      });
    } catch (error) {
      console.error('Audio upload error:', error.message);
      res.status(500).json({
        message: 'Server error during audio upload',
        error: error.message,
      });
    }
  }
);


router.get('/recordings', authMiddleware, async (req, res) => {
  try {
    // Paginated recordings retrieval
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const recordings = await AudioRecording.find({ user: req.user._id })
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .select('-path'); // Exclude file path for security

    const total = await AudioRecording.countDocuments({ user: req.user._id });

    res.json({
      recordings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecordings: total
    });
  } catch (error) {
    console.error('Fetch recordings error:', error);
    res.status(500).json({ 
      message: 'Server error fetching recordings',
      error: error.message 
    });
  }
});
////

// const mongoose = require('mongoose');
// router.get('/:id', authMiddleware, async (req, res) => {
//   try {
//     const audioId = req.params.id;

//     // Validate if the id is a valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(audioId)) {
//       return res.status(400).json({ message: 'Invalid audio ID' });
//     }

//     const userId = req.user._id;

//     const audioRecording = await AudioRecording.findOne({
//       _id: audioId,
//       user: userId
//     }).select('-path'); // Exclude file path for security

//     if (!audioRecording) {
//       return res.status(404).json({ message: 'Audio recording not found' });
//     }

//     res.json(audioRecording);
//   } catch (error) {
//     console.error('Fetch audio details error:', {
//       message: error.message,
//       stack: error.stack,
//       userId,
//       audioId
//     });
//     res.status(500).json({ 
//       message: 'Server error fetching audio details',
//       error: error.message 
//     });
//   }
// });

//


//audio get by id


router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const audioId = req.params.id;
    const userId = req.user._id;

    const audioRecording = await AudioRecording.findOne({
      _id: audioId,
      user: userId
    }).select('-path');

    if (!audioRecording) {
      return res.status(404).json({ message: 'Audio recording not found' });
    }

    // Ensure you're sending a predictable object structure
    res.json({
      _id: audioRecording._id,
      userId: userId.toString(), // Ensure it's a string
      filename: audioRecording.filename,
      originalName: audioRecording.originalName,
      mimetype: audioRecording.mimetype
    });
  } catch (error) {
    console.error('Fetch audio details error:', error);
    res.status(500).json({ 
      message: 'Server error fetching audio details',
      error: error.message 
    });
  }
});





// // Delete Audio Recording
// router.delete('/:id', authMiddleware, async (req, res) => {
//   try {
//     const audioRecording = await AudioRecording.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id
//     });

//     if (!audioRecording) {
//       return res.status(404).json({ message: 'Audio recording not found' });
//     }

//     // Optional: Delete the physical file
//     try {
//       await fs.unlink(audioRecording.path);
//     } catch (fileError) {
//       console.warn('Could not delete file:', fileError.message);
//     }

//     res.json({ 
//       message: 'Audio recording deleted successfully',
//       audioId: audioRecording._id 
//     });
//   } catch (error) {
//     console.error('Delete audio recording error:', error);
//     res.status(500).json({ 
//       message: 'Server error deleting audio recording',
//       error: error.message 
//     });
//   }
// });

module.exports = router;