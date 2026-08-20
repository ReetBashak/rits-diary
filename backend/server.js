const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.send('🍊 Tangerine Diary Backend is Live & Running on Vercel!');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🍃 MongoDB Connected'))
  .catch(err => console.error('DB Connection Failed:', err));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🍊 Tangerine Diary Server running on port ${PORT}`);
  });
}

module.exports = app;