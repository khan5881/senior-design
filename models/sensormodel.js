const mongoose = require("mongoose"); // requiring modules

var Schema = mongoose.Schema; // schema initilization
var ObjectId = mongoose.Schema.Types.ObjectId; // referencing a schema

var espdata = new Schema({
  // stores the esp32 data
  userinformation: { type: ObjectId },
  hygrometer: { type: Number, default: 0 },
  waterlevel: { type: Number, default: 0 },
  pH: { type: Number, default: 0.0 }
});

module.exports = mongoose.model("userdata", espdata);
