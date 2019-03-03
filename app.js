var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ParseServer = require('parse-server').ParseServer;

var usersRouter = require('./routes/users');

var app = express();

var ParseDashboard = require('parse-dashboard');

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": process.env.serverURL,
      "appId": process.env.appId,
      "masterKey": process.env.masterKey,
      "appName": "MyApp"
    }
  ],
  trustProxy: 1,
  "users": [
    {
      "user":"user1",
      "pass":"pass"
    }
  ]
});

var api = new ParseServer({
  databaseURI: process.env.MONGODB_URI, // Connection string for your MongoDB database
  appId: process.env.appId,
  masterKey: process.env.masterKey, // Keep this key secret!
  serverURL: process.env.serverURL // Don't forget to change to https if needed
});

// view engine setup
app.use(express.static(path.join(__dirname, 'client/build')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
