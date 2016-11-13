/*jshint esversion: 6 */
var rest = require("./rest");
var config = require("./config");
var jobs = require("./jobs");

var urls = {
	SENTIMENT: "http://challenge-alchemyapi.mybluemix.net/",
	TEXT_EXTRACTION: "https://gateway-a.watsonplatform.net/calls/url/URLGetText?url={url}&outputMode=json&apikey=",
	RECOMMENDATIONS: "http://0.0.0.0:5000/"
	// RECOMMENDATIONS: "http://173.236.121.79:5000/"
};

exports.get_sentiment = function(text, callback){
	rest.post(urls.SENTIMENT, {content: text}, callback);
};

exports.get_sentiment_url = function(url, callback){
	rest.get(urls.TEXT_EXTRACTION.replace("{url}", url) + config.bluemix_key, (data) => {
		exports.get_sentiment(data, callback);
	});
};

exports.recommend = function(uid, callback){
	jobs.get_friend_stranger_locations(uid, (data) => {
			rest.post(urls.RECOMMENDATIONS, data, callback);
	});
};
