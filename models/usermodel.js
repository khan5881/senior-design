const mongoose = require("mongoose"); // requiring modules

var Schema = mongoose.Schema; // schema initilization

var UserSchema = new Schema({
  // UserSchema stores the email (also username), firstname, lastname and passwordHash
  email: String,
  firstName: String,
  lastName: String,
  passwordHash: { type: String }
});

module.exports = mongoose.model("User", UserSchema);
