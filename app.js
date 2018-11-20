var express = require("express");
var app = express();
var db = require("./db");

var AuthController = require("./auth/authcontroller");
app.use("/api/auth", AuthController);

module.exports = app;
