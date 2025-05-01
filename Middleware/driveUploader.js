const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

const keyPath = path.join(__dirname, '../Config/noteboost-9338bf458b11.json');
console.log("🔑 Google keyFile path:", keyPath);

const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = '1SN58MoI5OQfWKPZYRATYlJnLC7azPAsI';

async function uploadToDrive(file) {
  try {
    if (!file || !file.buffer) throw new Error("File buffer missing!");

    console.log("📤 Uploading file to Drive:", file.originalname);
    console.log("📏 Buffer size:", file.buffer.length);

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const fileName = `${Date.now()}-${file.originalname}`;
    console.log("⏳ Uploading:", fileName);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: file.mimetype,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
    });

    console.log("✅ Google Drive upload response:", response.data);

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });

    const link = `https://drive.google.com/thumbnail?id=${response.data.id}&sz=s1080`;
    console.log("🌍 Public link:", link);
    return link;

  } catch (error) {
    console.error("❌ Upload to Drive failed:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data,
    });
    throw error;
  }
}

module.exports = { uploadToDrive };
