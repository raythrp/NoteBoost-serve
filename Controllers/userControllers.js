const { db } = require("../Config/firebase");

exports.getProfile = async (req, res) => {
  const email = req.user.email;

  try {
    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ profile: userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
};
