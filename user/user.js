const mongoose = require("mongoose"); // requiring modules

var UserSchema = new mongoose.Schema({
  // UserSchema stores the email (also username), firstname, lastname and passwordHash
  email: {
    type: String,
    required: "Please enter an Email address",
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill in a valid email address"
    ],
    index: true,
    unique: true
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  espid: [{ type: Number, unique: true, default: 0, required: true }]
});

module.exports = mongoose.model("User", UserSchema);