const express = require("express");
const { login, register, logout, updateUserInfo } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/update-user", updateUserInfo);

module.exports = router;