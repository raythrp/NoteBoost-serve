const express = require("express");
const multer = require("multer");
const { admin, db } = require("../Config/firebase");
const verifyToken = require("../Middleware/authMiddleware");
const { uploadToDrive } = require("../Middleware/driveUploader");
const router = express.Router();

// Konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ROUTE UPLOAD
router.post("/update-profile-picture", verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const file = req.file;
    const email = req.user.email;

    console.log("📥 Upload request received");
    console.log("👤 Email from token:", email);
    console.log("🖼️ File received:", file?.originalname, "| Type:", file?.mimetype, "| Size:", file?.size);

    if (!file) {
      console.log("❌ No file found in request.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🚀 Uploading file to Google Drive...");
    const driveLink = await uploadToDrive(file);
    console.log("✅ Drive link returned:", driveLink);

    console.log("💾 Saving link to Firestore...");
    await db.collection("profilePictures").doc(email).set({
      email: email,
      photoUrl: driveLink,
    });

    console.log("✅ Saved to Firestore.");
    res.json({ success: true, photoUrl: driveLink });

  } catch (error) {
    console.error("🔥 Failed in upload route:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data,
    });
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

// GET PROFILE PICTURE
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
    console.error("🔥 Failed fetching profile picture:", error);
    res.status(500).json({ error: "Failed to fetch profile picture" });
  }
});

module.exports = router;
