const admin = require("firebase-admin");
const fs = require('fs');
require("dotenv").config();
const serviceAccount = process.env.ENVIRONMENT == 'development' ? require("../noteboost-ff14a6993ce5.json") : JSON.parse(fs.readFileSync('/secrets/FIREBASE_KEY', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
  // , databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();
module.exports = { admin, db };