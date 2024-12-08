// const mongoose = require('mongoose');

// const audioSchema = new mongoose.Schema({
//     filename: { type: String, required: true },
//     contentType: { type: String, required: true },
//     data: { type: Buffer, required: true },
//     uploadedAt: { type: Date, default: Date.now },
// });

// const Audio = mongoose.model('Audio', audioSchema);

// module.exports = Audio;

const mongoose = require('mongoose');

const audioRecordingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  transcription: {
    type: String,
    default: null
  },
  summary: {
    type: String,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AudioRecording', audioRecordingSchema);