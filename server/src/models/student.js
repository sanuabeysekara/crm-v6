const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  dob: { type: Date, required: false },
  contact_no: String,
  email: { type: String, required: false },
  address: String
  // Add other fields as needed
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
