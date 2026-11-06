const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isEmailVerified: { type: Boolean, default: true },
    emailVerificationOtpHash: { type: String, default: null },
    emailVerificationOtpExpires: { type: Date, default: null },
    emailVerificationAttempts: { type: Number, default: 0 },
    emailVerificationOtpSentAt: { type: Date, default: null },
    resetOtpHash: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
    resetOtpAttempts: { type: Number, default: 0 },
    resetOtpSentAt: { type: Date, default: null },
    resetTokenHash: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
