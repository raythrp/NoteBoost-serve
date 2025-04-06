const express = require("express");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const imageRoutes = require('./Routes/imageRoutes');
const userRoutes = require("./Routes/userRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use('/api/image', imageRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


