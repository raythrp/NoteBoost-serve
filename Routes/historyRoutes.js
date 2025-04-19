const express = require("express");
const { admin, db } = require("../Config/firebase");
const verifyToken = require("../Middleware/authMiddleware");
const router = express.Router();

// Create History
router.post("/history", verifyToken, async (req, res) => {
  const { email, tanggal_waktu, kelas, mata_pelajaran, topik, isi_catatan_asli, hasil_enhance } = req.body;

  try {
    const historyRef = db.collection("history").doc();
    await historyRef.set({
      email,
      tanggal_waktu,
      kelas,
      mata_pelajaran,
      topik,
      isi_catatan_asli,
      hasil_enhance,
    });
    res.status(201).json({ message: "Catatan berhasil dibuat", id: historyRef.id });
  } catch (error) {
    res.status(500).json({ error: "Catatan gagal dibuat" });
  }
});

// Read History by Email (User Specific)
router.get("/history", verifyToken, async (req, res) => {
  const userEmail = req.user.email;

  try {
    const snapshot = await db.collection("history").where("email", "==", userEmail).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "Tidak ditemukan catatan" });
    }

    const historyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(historyList);
  } catch (error) {
    res.status(500).json({ error: "Gagal membaca catatan" });
  }
});

// Update History
router.put("/history/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { tanggal_waktu, kelas, mata_pelajaran, topik, isi_catatan_asli, hasil_enhance } = req.body;

  try {
    const historyRef = db.collection("history").doc(id);
    await historyRef.update({
      tanggal_waktu,
      kelas,
      mata_pelajaran,
      topik,
      isi_catatan_asli,
      hasil_enhance,
    });
    res.status(200).json({ message: "Catatan berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Catatan gagal diperbarui" });
  }
});

// Delete History
router.delete("/history/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const historyRef = db.collection("history").doc(id);
    await historyRef.delete();
    res.status(200).json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Catatan gagal dihapus" });
  }
});

module.exports = router;
