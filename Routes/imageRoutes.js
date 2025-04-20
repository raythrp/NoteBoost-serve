const express = require('express');
const router = express.Router();
const upload = require('../Middleware/upload');
const verifyToken = require('../Middleware/authMiddleware');
const { extractTextFromImage } = require('../Controllers/imageControllers');

router.post('/extract', verifyToken, upload.single('image'), extractTextFromImage);

module.exports = router;