/*jshint esversion: 6 */
var rest = require("./rest");
var config = require("./config");

var urls = {
	SENTIMENT: "http://challenge-alchemyapi-jaypriyadarshi-154.mybluemix.net/",
	TEXT_EXTRACTION: "https://gateway-a.watsonplatform.net/calls/url/URLGetText?url={url}&outputMode=json&apikey="
};

exports.get_sentiment = function(text, callback){
	rest.post(urls.SENTIMENT, {content: text}, callback);
};

exports.get_sentiment_url = function(url, callback){
	rest.get(urls.TEXT_EXTRACTION.replace("{url}", url) + config.bluemix_key, (data) => {
		exports.get_sentiment(data, callback);
	});
};
