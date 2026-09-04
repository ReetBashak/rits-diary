const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

// 1. Get All User Entries
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Fetch entries error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Entry (Receives JSON with direct Cloudinary URL)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, moodEmoji, mediaUrl, mediaType } = req.body;

    const newEntry = new Entry({
      userId: req.user.id,
      title: title || 'Untitled Memory',
      content: content || '',
      moodEmoji: moodEmoji || '🍊',
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || 'none'
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    console.error('Save entry error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete Entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    await Entry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;