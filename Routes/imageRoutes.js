const express = require('express');
const router = express.Router();
const upload = require('../Middleware/upload');
const verifyToken = require('../Middleware/authMiddleware');
const {
    extractTextFromImage,
    extractTextAndSave
  } = require('../Controllers/imageControllers');

router.post('/extract-and-save', verifyToken, upload.single('image'), extractTextAndSave);

module.exports = router;