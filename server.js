const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./Routes/authRoutes");
const imageRoutes = require('./Routes/imageRoutes');
const userRoutes = require("./Routes/userRoutes");
const historyRoutes = require("./Routes/historyRoutes");
const profilePictureRoutes = require('./Routes/profilePictureRoutes');
require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname, 'Public')));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "https://noteboost-772262781875.asia-southeast2.run.app",
    "https://noteboost-sg-772262781875.asia-southeast1.run.app",
    "https://www.noteboost.site",
    "https://noteboost.site",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());    
app.get("/", (req, res) => {
    res.send("NoteBoost Backend is alive!");
});
app.use("/api/auth", authRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/user", userRoutes);
app.use("/api", historyRoutes);
app.use("/api/profilepic", profilePictureRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

