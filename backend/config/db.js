const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
  }
};

module.exports = connectDatabase;