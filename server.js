const express = require("express");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const imageRoutes = require('./Routes/imageRoutes');
const userRoutes = require("./Routes/userRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());    
app.get("/", (req, res) => {
    res.send("NoteBoost Backend is alive!");
});
app.use("/api/auth", authRoutes);
app.use('/api/image', imageRoutes);
app.use("/api/user", userRoutes);

const PORT = 8080 ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


