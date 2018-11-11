const express = require("express"),
  bodyParser = require("body-parser"),
  app = express(),
  fs = require("fs"),
  mongoose = require("mongoose");

mongoose.connect(
  "mongodb://talha:talhakhan1@ds151523.mlab.com:51523/hydroponics",
  { useNewUrlParser: true }
); // connecting to cloud mongoDB

var urlencodedParser = bodyParser.urlencoded({ extended: false });
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

app.get("/headers", function(req, res) {
  res.set("Content-Type", "text/plain");
  var s = "";
  for (var name in req.headers) s += name + ": " + req.headers[name] + "\n";
  res.send(s);
});

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
