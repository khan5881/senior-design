var express = require("express");
var app = express();
var db = require("./db");

var UserController = require("./user/usercontroller");
app.use("/users", UserController);

var AuthController = require("./auth/authcontroller");
app.use("/api/auth", AuthController);

// app.post("/login_user", urlencodedParser, function(req, res) {
//   var newUser = user;
//   newUser.find({ email: req.body.email }, function(err, docs) {
//     if (err) {
//       // error handling from database side
//       res.send(err);
//     } else if (docs.length) {
//       // in the event that we have recieved a document
//       if (bcrypt.compareSync(req.body.password, docs[0].passwordHash)) {
//         res.send("Success");
//       } else {
//         res.send("Fail");
//       }
//     } else {
//       res.send("UserNotFound");
//     }
//   });
// });

// app.post("/test", urlencodedParser, function(req, res) {
// intialize a model, store values in it
// connect it to the user id
// store new db in thingy

//   var x = sensor;
//   var y = new x({
//     userinformation: newUser._id
//   });
// });

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

module.exports = app;
