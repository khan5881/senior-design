const express = require("express"), // calling express, bcrypt, app,fs,mongoose
  bodyParser = require("body-parser"),
  bcrypt = require("bcrypt"),
  app = express(),
  fs = require("fs"),
  mongoose = require("mongoose"),
  user = require("./models/usermodel"), // importing the user schema
  sensor = require("./models/sensormodel"); // importing the sensor schema.

var saltRounds = 10;

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

app.post("/register_user", urlencodedParser, function(req, res, id) {
  var newUser = user;
  var hash = bcrypt.hashSync(req.body.password, saltRounds);
  var register = new newUser({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    passwordHash: hash,
    espid: [req.body.espid1, req.body.espid2]
  })
    .save()
    .then(
      () => {
        res.send("User Successfully registered!");
      },
      e => {
        console.log(e);
        res.send("Error! Duplicate value");
      }
    );
});

app.post("/login_user", urlencodedParser, function(req, res) {
  var newUser = user;
  newUser.find({ email: req.body.email }, function(err, docs) {
    if (err) {
      // error handling from database side
      res.send(err);
    } else if (docs.length) {
      // in the event that we have recieved a document
      if (bcrypt.compareSync(req.body.password, docs[0].passwordHash)) {
        res.send("Success");
      } else {
        res.send("Fail");
      }
    } else {
      res.send("UserNotFound");
    }
  });
});

app.post("/test", urlencodedParser, function(req, res) {
  // intialize a model, store values in it
  // connect it to the user id
  // store new db in thingy

  var x = sensor;
  var y = new x({
    userinformation: newUser._id
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
