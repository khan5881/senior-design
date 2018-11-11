var userdetails = new User({
  email: "talha@gmail.com",
  firstName: "muhammad",
  lastName: "khan",
  passwordHash: "ggfswes"
});

userdetails.save().then(
  () => {
    console.log("user saved!");
  },
  e => {
    console.log("unable to save user", e);
  }
);

var Esp = new userdata({
  userinformation: userdetails
});

Esp.save().then(
  () => {
    console.log("esp saved!");
  },
  e => {
    console.log("unable to save user", e);
  }
);
