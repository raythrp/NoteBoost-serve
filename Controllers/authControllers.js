const { admin, db } = require("../Config/firebase");
const transporter = require("../Config/mailer");
const axios = require('axios');

exports.login = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.email_verified) {
      return res.status(401).json({ error: "Email belum diverifikasi." });
    }

    const email = decodedToken.email;
    const provider = decodedToken.firebase.sign_in_provider;
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        provider,
        jenjang: null,
        nama: decodedToken.name
      });

      return res.json({ email, needsAdditionalInfo: true });
    }

    const { nama, jenjang } = userDoc.data();

    if (!nama && decodedToken.name) {
      await userRef.update({ nama: decodedToken.name });
    }

    res.json({
      email,
      nama,
      jenjang,
      needsAdditionalInfo: !jenjang
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Token tidak valid atau login gagal." });
  }
};

exports.register = async (req, res) => {
  const { email, password, nama, jenjang } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await db.collection("users").doc(email).set({
      email,
      nama,
      jenjang,
      provider: "password"
    });

    const verificationLink = await admin.auth().generateEmailVerificationLink(email);

    await transporter.sendMail({
      from: `"NoteBoost" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verifikasi Email NoteBoost",
      html: `
        <p>Hai ${nama}!</p>
        <p>Terima kasih telah mendaftar di NoteBoost.</p>
        <p>Klik link berikut untuk verifikasi email kamu:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p><b>Note:</b> Jika kamu tidak merasa mendaftar, abaikan email ini.</p>
      `
    });

    res.json({ email, message: "Verification email sent to user" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUserInfo = async (req, res) => {
  const { email, jenjang } = req.body;

  try {
    const userRef = db.collection("users").doc(email);
    await userRef.update({ jenjang });

    res.json({ message: "User info updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateJenjang = async (req, res) => {
  const { email, jenjang } = req.body;

  if (!email || !jenjang) {
    return res.status(400).json({ error: "Email dan Jenjang wajib diisi" });
  }

  try {
    const userRef = db.collection("users").doc(email);
    
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    await userRef.update({ jenjang });

    res.json({ message: "Jenjang berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating jenjang:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat memperbarui jenjang" });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: "Logout handled on the client side" });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    const actionCodeSettingsReset = {
      url: 'https://noteboost-serve-772262781875.asia-southeast2.run.app/reset-password.html',
      handleCodeInApp: false,
    };
    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettingsReset);

    await transporter.sendMail({
      from: `"NoteBoost" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password NoteBoost",
      html: `
        <p>Hai ${user.displayName || email}!</p>
        <p>Kamu menerima email ini karena kami menerima permintaan reset password untuk akun kamu.</p>
        <p>Klik link di bawah ini untuk reset password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p><b>Note:</b> Jika kamu tidak merasa meminta reset password, abaikan email ini.</p>
      `
    });

    res.json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { oobCode, newPassword } = req.body;

  if (!oobCode || !newPassword) {
    return res.status(400).json({ error: "OobCode dan Password wajib diisi." });
  }

  try {
    const firebaseRes = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${process.env.FIREBASE_API_KEY}`, {
      oobCode,
      newPassword
    });

    res.json({ message: "Password berhasil direset" });
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error.message);
    res.status(400).json({ error: error.response?.data?.error?.message || "Gagal reset password" });
  }
};
