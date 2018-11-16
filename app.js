const express = require("express"),
  bodyParser = require("body-parser"),
  app = express(),
  fs = require("fs"),
  mongoose = require("mongoose"),
  user = require("./models/usermodel"), // importing the user schema
  sensor = require("./models/sensormodel"); // importing the sensor schema

mongoose.connect(
  "mongodb://talha:talhakhan1@ds259463.mlab.com:59463/hydroponics",
  { useNewUrlParser: true }
); // connecting to cloud mongoDB

var urlencodedParser = bodyParser.urlencoded({ extended: false }); // body
app.set("port", process.env.PORT || 3000);
app.use(express.static(__dirname));

function serveStaticFile(res, path, contentType, responseCode) {
  if (!responseCode) responseCode = 200;
  fs.readFile(__dirname + "/", function(err, data) {
    if (err) {
      res.writeHead(500, { "Content-Tye": "text/plain" });
      res.end("500 - Internal Error");
    } else {
      res.writeHead(responseCode, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

app.post("/register_user", urlencodedParser, function(req, res) {
  var newUser = user; // storing exported stuff here

  var register = new newUser({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    passwordHash: req.body.password
  })
    .save()
    .then(
      () => {
        console.log("successfully inserted!");
      },
      e => {
        console.log("Error! ", e);
      }
    );
  res.send(register);
});

app.post("/login_user", urlencodedParser, function(req, res) {
  var newUser = user;
  newUser
    .find({ email: req.body.email }, function(err, docs) {
      console.log(docs);
      if (docs[0].passwordHash == req.body.password) {
        res.send("Success");
      } else {
        res.send("Fail");
      }
    })
    .catch(err => {
      console.log(err);
      res.send("Fail", e);
    });
});

// let query = newUser.find({ email: req.body.email });
//   query
//     .exec()
//     .then(function(val) {
//       if (val[0].passwordHash == req.body.password) {
//         res.send("Success");
//       } else {
//         res.send("Fail");
//       }
//     })
//     .catch(err => {
//       console.log(err);
//       res.send("Fail", e);
//     });

//   // res.send(newUser);
// });

app.use(function(req, res) {
  res.type("text/plain");
  res.status(404);
  res.send("404 - Not Found");
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.type("text/plain");
  res.status(500);
  res.send("500 - Server Error");
});
app.listen(app.get("port"), function() {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});
