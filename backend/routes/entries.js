const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rits_diary_media',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'm4a', 'ogg']
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// 1. Fetch All User Entries (Clean sort by newest first)
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (err) {
    console.error('Fetch entries error:', err);
    res.status(500).json({ error: 'Failed to fetch entries', details: err.message });
  }
});

// 2. Create Entry (Handles both Text-only AND Media seamlessly)
router.post('/', auth, (req, res, next) => {
  upload.single('media')(req, res, (err) => {
    if (err) {
      console.warn('Multer skipped or error:', err.message);
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, content, moodEmoji } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let mediaUrl = null;
    let mediaType = 'none';

    if (req.file) {
      mediaUrl = req.file.path || req.file.secure_url || req.file.url;
      const mime = req.file.mimetype || '';

      if (mime.startsWith('video/') || (mediaUrl && mediaUrl.match(/\.(mp4|mov|webm)$/i))) {
        mediaType = 'video';
      } else if (mime.startsWith('audio/') || (mediaUrl && mediaUrl.match(/\.(mp3|wav|m4a|ogg)$/i))) {
        mediaType = 'audio';
      } else {
        mediaType = 'image';
      }
    }

    const newEntry = new Entry({
      userId: req.user.id,
      title: title.trim(),
      content: content ? content.trim() : '',
      moodEmoji: moodEmoji || '🍊',
      mediaUrl: mediaUrl,
      mediaType: mediaType
    });

    const savedEntry = await newEntry.save();
    return res.status(201).json(savedEntry);
  } catch (err) {
    console.error('Save entry server error:', err);
    return res.status(500).json({ error: 'Server error saving memory', details: err.message });
  }
});

// 3. Delete Entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await Entry.findByIdAndDelete(req.params.id);
    return res.json({ msg: 'Memory deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;