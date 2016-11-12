/*jshint esversion: 6 */
var nodemailer = require('nodemailer');
var cron = require('node-schedule');
var dash = require("./module");
var config = require('./config');
var servers =  require("./servers").servers;
var routes = require("./routes").routes;

var Datastore = require('nedb'), db = new Datastore({ filename: 'tmp/jobs.db', autoload: true });

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host : "outlook.office365.com",
    port: 587,
    debug: true,
    greetingTimeout: 10000,
    auth : {
        user : "adobenet\\" + config.email,
        pass : config.password
    }
});
