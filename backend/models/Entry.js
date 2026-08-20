const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  content:   { type: String, default: '' },
  moodEmoji: { type: String, default: '🍊' },
  mediaUrl:  { type: String, default: null },
  mediaType: { type: String, enum: ['image', 'video', 'audio', 'none'], default: 'none' }
}, { timestamps: true });

module.exports = mongoose.model('Entry', entrySchema);
