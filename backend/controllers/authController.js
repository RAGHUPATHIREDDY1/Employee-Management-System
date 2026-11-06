const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// OTP is valid for 5 minutes
const OTP_TIME = 5 * 60 * 1000;

// User must wait 60 seconds before requesting another OTP
const RESEND_TIME = 60 * 1000;

// Maximum wrong OTP attempts
const MAX_ATTEMPTS = 5;

// Reset token is valid for 10 minutes
const RESET_TOKEN_TIME = 10 * 60 * 1000;



const createToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};



const validEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


//  HASH OTP 

const hashValue = (value) => {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(value)
    .digest("hex");
};


// CREATE OTP

const createOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};


// REGISTER


const registerUser = async (req, res) => {
  try {

    const { name, email, password, confirmPassword } = req.body;

    // Check empty fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Please enter all fields."
      });
    }

    // Check email
    if (!validEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email."
      });
    }

    // Check passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check whether user already exists
    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      isEmailVerified: false
    });

    // Create OTP
    const otp = createOTP();

    // Save OTP information
    user.emailVerificationOtpHash = hashValue(otp);

    user.emailVerificationOtpExpires =
      new Date(Date.now() + OTP_TIME);

    user.emailVerificationAttempts = 0;

    user.emailVerificationOtpSentAt = new Date();

    await user.save();

    // Send OTP email
    try {

      await sendEmail(
        user.email,
        "Verify your email - Employee Management System",
        `Hello ${user.name},

Your email verification OTP is:

${otp}

This OTP will expire in 5 minutes.

If you did not create this account, please ignore this email.`
      );

    } catch (error) {

      // Delete user if email could not be sent
      await User.deleteOne({
        _id: user._id
      });

      console.log("Email error:", error);

      return res.status(500).json({
        message: "Unable to send verification email."
      });
    }

    return res.status(201).json({
      message: "Verification OTP sent. Please check your email.",
      email: user.email
    });

  } catch (error) {

    console.log("Register error:", error);

    return res.status(500).json({
      message: "Registration failed."
    });
  }
};


// VERIFY EMAIL OTP

const verifyEmail = async (req, res) => {
  try {

    const { email, otp } = req.body;

    // Check OTP format
    if (!email || !/^\d{6}$/.test(otp || "")) {
      return res.status(400).json({
        message: "OTP must be 6 digits."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid OTP."
      });
    }

    // Already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified."
      });
    }

    // Check attempts
    if (user.emailVerificationAttempts >= MAX_ATTEMPTS) {
      return res.status(400).json({
        message: "Too many attempts. Please request a new OTP."
      });
    }

    // Check expiry
    if (
      !user.emailVerificationOtpHash ||
      !user.emailVerificationOtpExpires ||
      user.emailVerificationOtpExpires < new Date()
    ) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP."
      });
    }

    // Compare OTP
    const enteredOTP = hashValue(otp);

    if (enteredOTP !== user.emailVerificationOtpHash) {

      user.emailVerificationAttempts += 1;

      await user.save();

      return res.status(400).json({
        message: "OTP is incorrect."
      });
    }

    // Email verified
    user.isEmailVerified = true;

    // Remove OTP
    user.emailVerificationOtpHash = null;
    user.emailVerificationOtpExpires = null;
    user.emailVerificationAttempts = 0;
    user.emailVerificationOtpSentAt = null;

    await user.save();

    return res.status(200).json({
      message: "Email verification successful."
    });

  } catch (error) {

    console.log("Verify email error:", error);

    return res.status(500).json({
      message: "Unable to verify email."
    });
  }
};

// RESEND EMAIL VERIFICATION OTP

const resendVerificationOtp = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email || !validEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(400).json({
        message: "Unable to resend OTP."
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified."
      });
    }

    // Check 60 second cooldown
    if (user.emailVerificationOtpSentAt) {

      const timePassed =
        Date.now() - user.emailVerificationOtpSentAt.getTime();

      if (timePassed < RESEND_TIME) {

        return res.status(429).json({
          message: "Please wait before requesting another OTP."
        });
      }
    }

    // Create new OTP
    const otp = createOTP();

    user.emailVerificationOtpHash = hashValue(otp);

    user.emailVerificationOtpExpires =
      new Date(Date.now() + OTP_TIME);

    user.emailVerificationAttempts = 0;

    user.emailVerificationOtpSentAt = new Date();

    await user.save();

    // Send email
    await sendEmail(
      user.email,
      "New verification OTP - Employee Management System",
      `Hello ${user.name},

Your new verification OTP is:

${otp}

This OTP will expire in 5 minutes.`
    );

    return res.status(200).json({
      message: "A new verification OTP has been sent."
    });

  } catch (error) {

    console.log("Resend verification error:", error);

    return res.status(500).json({
      message: "Unable to send OTP."
    });
  }
};


// LOGIN

const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // Compare password
    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email
      });
    }

    // Create JWT
    const token = createToken(user._id);

    return res.status(200).json({
      message: "Login successful.",
      token: token,
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log("Login error:", error);

    return res.status(500).json({
      message: "Login failed."
    });
  }
};


// FORGOT PASSWORD

const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email."
      });
    }

    if (!validEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    });

    // Always return same message
  
    const message =
      "If an account exists with this email, a password reset OTP has been sent.";

    if (!user) {
      return res.status(200).json({
        message
      });
    }

    // Check cooldown
    if (user.resetOtpSentAt) {

      const timePassed =
        Date.now() - user.resetOtpSentAt.getTime();

      if (timePassed < RESEND_TIME) {
        return res.status(200).json({
          message
        });
      }
    }

    // Create OTP
    const otp = createOTP();

    user.resetOtpHash = hashValue(otp);

    user.resetOtpExpires =
      new Date(Date.now() + OTP_TIME);

    user.resetOtpAttempts = 0;

    user.resetOtpSentAt = new Date();

    await user.save();

    // Send email
    await sendEmail(
      user.email,
      "Password Reset OTP - Employee Management System",
      `Hello ${user.name},

Your password reset OTP is:

${otp}

This OTP will expire in 5 minutes.

If you did not request a password reset, please ignore this email.`
    );

    return res.status(200).json({
      message
    });

  } catch (error) {

    console.log("Forgot password error:", error);

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset OTP has been sent."
    });
  }
};


// VERIFY PASSWORD RESET OTP

const verifyResetOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    if (!email || !/^\d{6}$/.test(otp || "")) {
      return res.status(400).json({
        message: "OTP must be 6 digits."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(400).json({
        message: "OTP is incorrect."
      });
    }

    // Check attempts
    if (user.resetOtpAttempts >= MAX_ATTEMPTS) {
      return res.status(400).json({
        message: "Too many attempts. Please request a new OTP."
      });
    }

    // Check expiry
    if (
      !user.resetOtpHash ||
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP."
      });
    }

    // Compare OTP
    const enteredOTP = hashValue(otp);

    if (enteredOTP !== user.resetOtpHash) {

      user.resetOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message: "OTP is incorrect."
      });
    }

    // Create reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Save only hash of reset token
    user.resetTokenHash = hashValue(resetToken);

    user.resetTokenExpires =
      new Date(Date.now() + RESET_TOKEN_TIME);

    // OTP can no longer be used
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    user.resetOtpSentAt = null;

    await user.save();

    return res.status(200).json({
      message: "OTP verified.",
      resetToken: resetToken
    });

  } catch (error) {

    console.log("Verify reset OTP error:", error);

    return res.status(500).json({
      message: "Unable to verify OTP."
    });
  }
};


// RESET PASSWORD

const resetPassword = async (req, res) => {
  try {

    const {
      resetToken,
      newPassword,
      confirmPassword
    } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Please enter and confirm your new password."
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    // Hash reset token
    const tokenHash = hashValue(resetToken);

    // Find user
    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpires: {
        $gt: new Date()
      }
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Reset session is invalid or expired. Please request a new OTP."
      });
    }

    // Hash new password
    const newHashedPassword =
      await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = newHashedPassword;

    // Remove reset information
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    user.resetOtpSentAt = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please login."
    });

  } catch (error) {

    console.log("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password."
    });
  }
};



// EXPORT FUNCTIONS
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyEmail,
  resendVerificationOtp,
  verifyResetOtp,
  resetPassword
};