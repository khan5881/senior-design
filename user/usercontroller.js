var express = require("express"),
  router = express.Router(),
  bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require("./user");

router.post('/', function (req, res) {
    User.create({
            email : req.body.email,
            firstName : req.body.fname,
            lastName : req.body.lname,
            password : req.body.password,
            espid: [req.body.espid, req.body.espid]
        }, 
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});


module.exports = router;
