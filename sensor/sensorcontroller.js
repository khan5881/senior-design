var express = require("express"),
  router = express.Router(),
  bodyParser = require("body-parser"),
  jwt = require("jsonwebtoken"),
  User = require("../user/user"),
  Sensor = require("./sensormodel"),
  VerifyToken = require("../Auth/VerifyToken");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/dailyval_one", VerifyToken, function(req, res) {
  User.findById(req.userId, { passwordHash: 0 }, function(err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");

    let x = Sensor.find({ espid: user.espid[0] }, { _id: 0 })
      .sort({ timestamp: 1 })
      .limit(24);

    x.exec(function(err, docs) {
      if (err) console.log(err);
      res.status(200).send(docs);
    });
  });
});

router.get("/dailyval_two", VerifyToken, function(req, res) {
  User.findById(req.userId, { passwordHash: 0 }, function(err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");

    let x = Sensor.find({ espid: user.espid[1] }, { _id: 0 })
      .sort({ timestamp: 1 })
      .limit(24);

    x.exec(function(err, docs) {
      if (err) console.log(err);
      res.status(200).send(docs);
    });
  });
});
module.exports = router;
