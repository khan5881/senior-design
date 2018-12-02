var express = require("express"),
  router = express.Router(),
  bodyParser = require("body-parser"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  User = require("../user/user"),
  config = require("../config"),
  VerifyToken = require("./VerifyToken");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// registering a user
router.post("/register", function(req, res) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 10); // text and salt
  // create user, then create a token for them
  User.create(
    {
      firstName: req.body.fname,
      lastName: req.body.lname,
      email: req.body.email,
      passwordHash: hashedPassword,
      espid: [req.body.espid1, req.body.espid2]
    },
    function(err, user) {
      if (err) return res.status(500).send("Error registering the user!");
      // creates a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // we sign user with the secret pass, expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token });
    }
  );
});

router.post("/login", function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) return res.status(500).send("Error on the server.");
    if (!user) return res.status(404).send("No user found.");

    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.passwordHash
    );

    if (!passwordIsValid)
      return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    // return the information including token as JSON
    res.status(200).send({ auth: true, token: token, user });
  });
});

router.get("/me", VerifyToken, function(req, res) {
  User.findById(req.userId, { passwordHash: 0 }, function(err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});

router.get("/logout", function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;
