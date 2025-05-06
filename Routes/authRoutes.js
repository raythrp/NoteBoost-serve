const express = require("express");
const { login, register, logout, updateUserInfo, updateJenjang, forgotPassword, resetPassword, checkTokenExpiry} = require("../Controllers/authControllers");
const verifyToken = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/update-user", verifyToken, updateUserInfo);
router.post("/update-jenjang", verifyToken, updateJenjang);  
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/check", verifyToken ,checkTokenExpiry);
module.exports = router;