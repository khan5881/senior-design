const mqtt = require("mqtt"),
  mongoose = require("mongoose"),
  sensor = require("./models/sensormodel"); // importing the sensor schema.
  //user = require("./models/usermodel");

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
  console.log(topic); // this is the whole topic string
  console.log(JSON.parse(message.toString())); // this is the message that we want to store
  console.log(topic.split("/")[1]); // this is where we split the topic from

  let data = JSON.parse(message.toString());

  // let toSave = new sensor({
  //   espid: topic.split("/")[1],
  //   hygrometer: data.hygrometer,
  //   waterlevel: data.waterlevel
  // });

  // toSave.save().then(
  //   () => {
  //     console.log("data stored successfully for " + topic.split("/")[1]);
  //   },
  //   () => {
  //     console.log("Error! data did not save");
  //   }
  // );
});
