require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("./models/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var categoryRouter = require("./routes/category");
var sousCategoryRouter = require("./routes/sousCategory");
var dcmRouter = require("./routes/dcm");
var notificationRouter = require("./routes/notification")
var configRouter = require('./routes/config')
var app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/category", categoryRouter);
app.use("/souscategory", sousCategoryRouter);
app.use("/dcm", dcmRouter);
app.use("/config", configRouter);
// app.use("/notification", notificationRouter)




module.exports = app;
