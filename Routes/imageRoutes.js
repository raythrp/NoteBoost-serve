const express = require('express');
const router = express.Router();
const upload = require('../Middleware/upload');
const { extractTextFromImage } = require('../Controllers/imageControllers');

router.post('/extract', upload.single('image'), extractTextFromImage);

module.exports = router;
