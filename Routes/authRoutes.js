const express = require("express");
const { login, register, logout, updateUserInfo } = require("../Controllers/authControllers");
const verifyToken = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/update-user", verifyToken, updateUserInfo);

module.exports = router;