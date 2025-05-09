const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { db } = require("../Config/firebase");
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const localKeyPath = path.join(__dirname, 'noteboost-243b40968aef.json');
const gcpKeyPath = '/secrets/cloud_vision/CLOUD_VISION_KEY';
const keyFilename = fs.existsSync(localKeyPath) ? localKeyPath : gcpKeyPath;
const client = new ImageAnnotatorClient({
    keyFilename: keyFilename,
});
console.log(`Menggunakan file secret dari: ${keyFilename}`);
require('dotenv').config()



const extractTextFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        form.append('language', 'eng');
        form.append('isOverlayRequired', 'false');

        const response = await axios.post('https://api.ocr.space/parse/image', form, {
            headers: {
                ...form.getHeaders(),
                apikey: process.env.OCR_API_KEY,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const parsedText = response.data?.ParsedResults?.[0]?.ParsedText || 'No text found';

        return res.status(200).json({
            success: true,
            extractedText: parsedText
        });
    } catch (error) {
        console.error('OCR API Error:', error.response?.data || error.message || error);
        return res.status(500).json({ error: 'Something went wrong while extracting text' });
    }
};

const extractTextAndSave = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        console.log("File uploaded:", req.file);
        console.log("User email:", req.user.email);

        // Gambar diubah menjadi buffer untuk dikirim ke Vision API
        const imageBuffer = req.file.buffer;

        // Mengirim gambar untuk analisis OCR menggunakan Vision API
        const [result] = await client.textDetection(imageBuffer);
        const parsedText = result.textAnnotations.length > 0 ? result.textAnnotations[0].description : 'No text found';

        return res.status(201).json({
            message: 'Catatan berhasil dibuat dari gambar',
            extractedText: parsedText,
        });
    } catch (error) {
        console.error('OCR Save Error:', error.message || error);
        return res.status(500).json({ error: 'Gagal mengekstrak dan menyimpan catatan' });
    }
};

module.exports = {
    extractTextFromImage,
    extractTextAndSave,
  };