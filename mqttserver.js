const mqtt = require("mqtt"),
  mongoose = require("mongoose"),
  sensor = require("./models/sensormodel"); // importing the sensor schema.

const client = mqtt.connect("mqtt://broker.mqttdashboard.com");
mongoose.connect(
  "mongodb://talha:talhakhan1@ds259463.mlab.com:59463/hydroponics",
  { useNewUrlParser: true }
);

client.on("connect", function() {
  client.subscribe("hydroponics/#");
  console.log("client has subscribed successfully");
});

client.on("message", (topic, message) => {
  console.log(topic);
  console.log(message.toString());
  console.log(topic.split("/")[1]);
});
