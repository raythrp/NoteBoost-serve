const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../Config/noteboost-9338bf458b11.json'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

const FOLDER_ID = '1SN58MoI5OQfWKPZYRATYlJnLC7azPAsI';

async function uploadToDrive(file) {
  try {
    if (!file || !file.buffer) throw new Error("File buffer missing!");

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

    const fileId = response.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const link = `https://drive.google.com/thumbnail?id=${fileId}&sz=s1080`;
    console.log("✅ Uploaded:", link);
    return link;

  } catch (error) {
    console.error("❌ Upload to Drive failed:", error.message);
    throw error;
  }
}
module.exports = { uploadToDrive };
