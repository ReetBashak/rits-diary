const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rits_diary_media',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'm4a', 'ogg']
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 1. Get All Entries for Logged-in User
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create New Entry (Handles Text, Media Files & Recorded Audio/Video)
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { title, content, moodEmoji } = req.body;
    let mediaUrl = null;
    let mediaType = 'none';

    if (req.file) {
      mediaUrl = req.file.path || req.file.secure_url;
      const mime = req.file.mimetype || '';
      
      if (mime.startsWith('image/')) {
        mediaType = 'image';
      } else if (mime.startsWith('video/')) {
        mediaType = 'video';
      } else if (mime.startsWith('audio/')) {
        mediaType = 'audio';
      } else {
        mediaType = 'image';
      }
    }

    const newEntry = new Entry({
      userId: req.user.id,
      title: title || 'Untitled Entry',
      content: content || '',
      moodEmoji: moodEmoji || '🍊',
      mediaUrl: mediaUrl,
      mediaType: mediaType
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete Entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });

    await Entry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;