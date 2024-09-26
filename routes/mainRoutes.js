const express = require('express');
const path = require('path');
const router = express.Router();

// Home Page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// About Page
router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'about.html'));
});

module.exports = router;
