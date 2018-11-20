var express = require("express"),
  router = express.Router(),
  bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require("./user");

// ADDING USER
router.post("/", function(req, res) {
  User.create(
    {
      email: req.body.email,
      firstName: req.body.fname,
      lastName: req.body.lname,
      passwordHash: req.body.password
      //  espid: [req.body.espid1, req.body.espid2]
    },
    function(err, user) {
      if (err)
        return res
          .status(500)
          .send("There was a problem adding the information to the database.");
      res.status(200).send(user);
    }
  );
});

// VIEWING ALL USERS
router.get("/", function(req, res) {
  User.find({}, function(err, users) {
    if (err)
      return res.status(500).send("There was a problem finding the users.");
    res.status(200).send(users);
  });
});

//RETRIVING SINGLE USER
router.get("/:id", function(req, res) {
  // :/id is a placeholder for the user
  User.findById(req.params.id, function(err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});

// DELETING A USER (MIGHT REMOVE THIS FUNCTIONALITY)
router.delete("/:id", function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if (err)
      return res.status(500).send("There was a problem deleting the user.");
    res.status(200).send("User " + user.name + " was deleted.");
  });
});

// UPDATES A SINGLE USER (MIGHT REMOVE IT)
router.put("/:id", function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(
    err,
    user
  ) {
    if (err)
      return res.status(500).send("There was a problem updating the user.");
    res.status(200).send(user);
  });
});

module.exports = router;
