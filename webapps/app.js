/*jshint esversion: 6 */
var express = require('express');
var app = express();
var dash = require("./module");

var path = require('path');
var mime = require('mime');
var child_process= require("child_process");
var config = require("./config");
var jobs = require("./jobs");

// include the routes
var routes = require("./routes").routes;

// set the view engine to ejs
app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// include all folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/node_modules/material-design-lite'));
app.set('views', __dirname + '/views');

//set port
app.set('port', (process.env.PORT || config.port));

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

app.get(routes.root, function(req, res) {
  // dash.get_sentiment("this is some random text", console.log);
  // dash.get_sentiment_url("http://www.willflyforfood.net/2015/04/20/the-first-timers-travel-guide-to-seoul-south-korea/", console.log);
  res.render('index', {
    routes : JSON.stringify(routes),
    options : JSON.stringify({}),
  });
});

app.post(routes.root, function(req, res) {
  if (req.body) {
    doc = req.body;
    jobs.add_or_update(doc);
  }
  res.json({});
});

app.listen(app.get('port'), function() {
  console.log("Running 8000");
});

app.get(routes.recommend, function (req, res) {
  dash.recommend(req.query.uid, (data) => {
    res.json({matches: data});
  });
});
