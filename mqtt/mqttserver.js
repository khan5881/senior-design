const mqtt = require("mqtt"),
  mongoose = require("mongoose"),
  sensor = require("../sensor/sensormodel"); // importing the sensor schema.

const client = mqtt.connect("mqtt://broker.mqttdashboard.com");
mongoose.connect(
  "mongodb://talha:talhakhan1@ds259463.mlab.com:59463/hydroponics",
  { useNewUrlParser: true }
);

client.on("connect", function() {
  client.subscribe("esp32/#");
  console.log("client has subscribed successfully");
});

client.on("message", (topic, message) => {
  console.log(topic); // this is the whole topic string
  console.log(JSON.parse(message.toString())); // this is the message that we want to store
  console.log(topic.split("/")[1]); // this is where we split the topic from


  let data = JSON.parse(message.toString());

  let toSave = new sensor({
    espid: topic.split("/")[1],
    hygrometer: [
      data["hygrometer"]["hygro1"],
      data["hygrometer"]["hygro2"],
      data["hygrometer"]["hygro3"],
      data["hygrometer"]["hygro4"]
    ],
    waterlevel: data.waterlevel,
    pH: data.pH,
    humidity: data.humidity,
    timestamp: Date.now()
  })
    .save()
    .then(
      () => {
        console.log("data stored successfully for " + topic.split("/")[1]);
      },
      () => {
        console.log("Error! data did not save");
      }
    );
});