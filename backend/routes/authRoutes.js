const express = require("express");

const {
    registerUser,
    loginUser,
    forgotPassword,
    verifyEmail,
    resendVerificationOtp,
    verifyResetOtp,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();

// Register new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Email verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-otp", resendVerificationOtp);

// Forgot password
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;