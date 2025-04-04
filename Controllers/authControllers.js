const { admin, db } = require("../Config/firebase");

exports.login = async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;
    const provider = decodedToken.firebase.sign_in_provider;
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        provider,
        kelas: null,
        jenjang: null
      });
      return res.json({ email, needsAdditionalInfo: true });
    }
    res.json({ email, needsAdditionalInfo: !userDoc.data().kelas || !userDoc.data().jenjang });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.register = async (req, res) => {
  const { email, password, nama, kelas, jenjang } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await db.collection("users").doc(email).set({
      email,
      nama,
      kelas,
      jenjang,
      provider: "password"
    });
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    res.json({ email, message: "Verification email sent", verificationLink });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUserInfo = async (req, res) => {
  const { email, kelas, jenjang } = req.body;
  try {
    const userRef = db.collection("users").doc(email);
    await userRef.update({ kelas, jenjang });
    res.json({ message: "User info updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: "Logout handled on the client side" });
};