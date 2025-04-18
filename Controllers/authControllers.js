const { admin, db } = require("../Config/firebase");
const transporter = require("../Config/mailer");

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
        jenjang: null
      });

      return res.json({ email, needsAdditionalInfo: true });
    }

    const { jenjang } = userDoc.data();

    res.json({
      email,
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

exports.logout = async (req, res) => {
  res.json({ message: "Logout handled on the client side" });
};
