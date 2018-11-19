var app = require("./app");
var port = process.env.PORT || 3000;

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
var server = app.listen(port, function() {
  console.log("Express server listening on port " + port);
});
