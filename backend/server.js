const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🍊 Tangerine Diary Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('DB Connection Failed:', err));