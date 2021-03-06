var createError = require("http-errors");
var express = require("express");
var session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var flash = require("express-flash");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var subjectRouter = require("./routes/subject");
var fileUploadRouter = require("./routes/uploadFile");

var ejs = require("ejs");

const fileUpload = require("express-fileupload");

const mongoose = require("mongoose");

const dbPass = require("./credentials/mongoCloud").psw;

// connect to MongoDB
var url = `mongodb+srv://admin:${dbPass}@clustercampus-5u7au.mongodb.net/entregable?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

var db = mongoose.connection;

db.once("open", () => {
  console.log("connected");
});

var app = express();

//session set up

//no compatible con flash
/*
app.use(
  session({
    secret: "shtyo12poi",
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);
*/
// view engine setup
app.set("view engine", "ejs");

app.use(fileUpload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("keyboard cat"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(express.static(path.join(__dirname, "public")));

app.use(flash());

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/subject", subjectRouter);
app.use("/fileUpload", fileUploadRouter);
app.use("/files", express.static(path.join(__dirname, "files")));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", { errors: err });
});

module.exports = app;
