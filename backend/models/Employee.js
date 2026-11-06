const mongoose = require("mongoose");

const departments = ["Development", "HR", "Testing", "Management", "Sales"];

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, enum: departments },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
