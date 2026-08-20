const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Entry = require('../models/Entry');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = multer({ storage });

// Get all entries
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create entry
router.post('/', [auth, upload.single('media')], async (req, res) => {
  try {
    const { title, content, moodEmoji } = req.body;
    let mediaUrl = null;
    let mediaType = 'none';

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      const mime = req.file.mimetype;
      if (mime.startsWith('image/')) mediaType = 'image';
      else if (mime.startsWith('video/')) mediaType = 'video';
      else if (mime.startsWith('audio/')) mediaType = 'audio';
    }

    const newEntry = new Entry({
      userId: req.user.id,
      title,
      content,
      moodEmoji,
      mediaUrl,
      mediaType
    });

    const saved = await newEntry.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit / Update entry
router.put('/:id', [auth, upload.single('media')], async (req, res) => {
  try {
    const { title, content, moodEmoji } = req.body;
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });

    entry.title = title || entry.title;
    entry.content = content !== undefined ? content : entry.content;
    entry.moodEmoji = moodEmoji || entry.moodEmoji;

    if (req.file) {
      entry.mediaUrl = `/uploads/${req.file.filename}`;
      const mime = req.file.mimetype;
      if (mime.startsWith('image/')) entry.mediaType = 'image';
      else if (mime.startsWith('video/')) entry.mediaType = 'video';
      else if (mime.startsWith('audio/')) entry.mediaType = 'audio';
    }

    const updated = await entry.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
