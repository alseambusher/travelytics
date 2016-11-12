/*jshint esversion: 6 */
var urllib = require('urllib');

exports.post = function(url, body, callback) {
  urllib.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(body)
  }, function (err, data, res) {
    if (err) {
      console.log(err);
    }
    console.log(res.statusCode);
    console.log(res.headers);
    callback(data.toString());
  });
};

exports.get= function(url, callback) {
  urllib.request(url, {
    method: 'GET',
  }, function (err, data, res) {
    if (err) {
      console.log(err);
    }
    console.log(res.statusCode);
    console.log(res.headers);
    callback(data.toString());
  });
};
