const express = require("express");
const { admin, db } = require("../Config/firebase");
const verifyToken = require("../Middleware/authMiddleware");
const router = express.Router();
const { convert } = require("quill-delta-to-html");
const axios = require('axios');

router.post("/history", verifyToken, async (req, res) => {
  const { tanggal_waktu, kelas, mata_pelajaran, topik, isi_catatan_asli } = req.body;

  const email = req.user.email;

  try {
    const historyRef = db.collection("history").doc();
    await historyRef.set({
      email,
      tanggal_waktu,
      kelas,
      mata_pelajaran,
      topik,
      isi_catatan_asli,
      hasil_enhance: null,
    });
    res.status(201).json({ message: "Catatan berhasil dibuat", id: historyRef.id });
  } catch (error) {
    res.status(500).json({ error: "Catatan gagal dibuat" });
  }
});

router.get("/history", verifyToken, async (req, res) => {
  const userEmail = req.user.email;

  try {
    const snapshot = await db.collection("history").where("email", "==", userEmail).get();
    if (snapshot.empty) {
      return res.status(200).json({ message: "Tidak ditemukan catatan" });
    }

    const historyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(historyList);
  } catch (error) {
    res.status(500).json({ error: "Gagal membaca catatan" });
  }
});

router.put("/history/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { tanggal_waktu, isi_catatan_asli } = req.body;
  const userEmail = req.user.email;

  try {
    const historyRef = db.collection("history").doc(id);
    const doc = await historyRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    if (doc.data().email !== userEmail) {
      return res.status(403).json({ error: "Akses ditolak" });
    }

    await historyRef.update({ tanggal_waktu, isi_catatan_asli });

    res.status(200).json({ message: "Catatan berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Catatan gagal diperbarui" });
  }
});

router.put("/history/:id/update-details", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { kelas, mata_pelajaran, topik } = req.body;
  const userEmail = req.user.email;

  try {
    const historyRef = db.collection("history").doc(id);
    const doc = await historyRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Catatan tidak ditemukan" });
    if (doc.data().email !== userEmail) return res.status(403).json({ error: "Akses ditolak" });

    await historyRef.update({ kelas, mata_pelajaran, topik });

    res.status(200).json({ message: "Kelas, Mata Pelajaran, dan Topik berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui Kelas, Mata Pelajaran, dan Topik" });
  }
});

router.delete("/history/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email;

  try {
    const historyRef = db.collection("history").doc(id);
    const doc = await historyRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Catatan tidak ditemukan" });
    if (doc.data().email !== userEmail) return res.status(403).json({ error: "Akses ditolak" });

    await historyRef.delete();
    res.status(200).json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Catatan gagal dihapus" });
  }
});

router.put("/history/:id/update-enhanced", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { hasil_enhance } = req.body;
  const userEmail = req.user.email;

  try {
    const historyRef = db.collection("history").doc(id);
    const doc = await historyRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Catatan tidak ditemukan" });
    if (doc.data().email !== userEmail) return res.status(403).json({ error: "Akses ditolak" });

    await historyRef.update({ hasil_enhance });

    res.status(200).json({ message: "Hasil enhance berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menyimpan hasil enhance" });
  }
});

router.post("/history/:id/enhance", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { htmlContent } = req.body;
  const userEmail = req.user.email;

  try {
    const historyRef = db.collection("history").doc(id);
    const historyDoc = await historyRef.get();

    if (!historyDoc.exists) {
      return res.status(404).json({ error: "Catatan tidak ditemukan" });
    }

    if (historyDoc.data().email !== userEmail) return res.status(403).json({ error: "Akses ditolak" });

    const { topik, kelas, mata_pelajaran, jenjang } = historyDoc.data();

    const prompt = `Konteks Catatan:
      Jenjang Pendidikan: ${jenjang}
      Kelas: ${kelas}
      Mata Pelajaran: ${mata_pelajaran}
      Topik: ${topik}
      
      Tolong Enhance catatan berikut menjadi lebih rapi dan sesuai dengan standar jenjang, kelas, mata pelajaran dan topik yang telah diberikan dan kembalikan output dengan HTML sederhana tanpa css, tidak usah pakai <!DOCTYPE html>, tidak usah pakai kalimat pengantar dan penutup, tidak usah pakai title, langsung isi catatan saja:

      "${htmlContent}"`;

    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }], 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    const enhancedNote = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!enhancedNote) {
      return res.status(500).json({ error: "Gagal mendapatkan hasil enhance dari Gemini" });
    }

    res.status(200).json({ message: "Catatan berhasil dienhance", hasil_enhance: enhancedNote });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Gagal melakukan enhance catatan" });
  }
});

router.get("/history/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user.email;

  try {
    const historyRef = db.collection("history").doc(id);
    const doc = await historyRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Catatan tidak ditemukan" });
    if (doc.data().email !== userEmail) return res.status(403).json({ error: "Akses ditolak" });

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil catatan" });
  }
});

module.exports = router;