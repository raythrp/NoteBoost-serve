const express = require("express");
const verifyToken = require("../Middleware/authMiddleware");
const { getProfile } = require("../Controllers/userControllers");

const router = express.Router();

router.get("/profile", verifyToken, getProfile);

module.exports = router;
