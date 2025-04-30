const express = require("express");
const multer = require("multer"); // buat handle file upload
const { admin, db } = require("../Config/firebase");
const verifyToken = require("../Middleware/authMiddleware");
const { uploadToDrive } = require("../Middleware/driveUploader"); // nanti kita buat
const router = express.Router();

// Konfigurasi multer (buat upload file ke memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route upload profile picture
router.post("/update-profile-picture", verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const file = req.file;
    const email = req.user.email; // dapat dari token
    
    console.log("📥 Upload request received");
    console.log("👤 Email from token:", email);
    console.log("🖼️ File uploaded:", file?.originalname, "| Type:", file?.mimetype, "| Size:", file?.size);

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🚀 Uploading file to Google Drive...");
    // Upload file ke Google Drive
    const driveLink = await uploadToDrive(file);
    console.log("✅ Drive link returned:", driveLink);
    // Save link ke Firestore (collection: profilePictures)
    const docRef = db.collection("profilePictures").doc(email);
    await docRef.set({
      email: email,
      photoUrl: driveLink,
    });

    res.json({ success: true, photoUrl: driveLink });

  } catch (error) {
    console.error("🔥 Failed in upload route:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

router.get("/get-profile-picture", verifyToken, async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const doc = await db.collection("profilePictures").doc(email).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    const data = doc.data();
    res.json({ photoUrl: data.photoUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile picture" });
  }
});

module.exports = router;
