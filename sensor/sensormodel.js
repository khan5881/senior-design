const mongoose = require("mongoose"); // requiring modules

var Schema = mongoose.Schema; // schema initilization

var espdata = new Schema({
  espid: { type: Number, default: 0, required: true },
  hygrometer: { type: Number, default: 0 },
  waterlevel: { type: Number, default: 0 },
  pH: { type: Number, default: 0.0 },
  timestamp: { required: true, type: Date }
});

module.exports = mongoose.model("userdata", espdata);
