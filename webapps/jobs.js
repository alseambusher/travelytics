/*jshint esversion: 6 */
var Datastore = require('nedb');
var db = new Datastore({ filename: 'tmp/users.db', autoload: true });

exports.add_or_update = function(obj) {
  // TODO see if it is there and update
  console.log(typeof obj);
  db.find({ id: obj.id }, function (err, docs) {
    console.log(docs)
    if (docs.length == 0){
      db.insert(obj, function(err, newDoc){
        console.log(err);
      });
    } else {
      db.update({ id: obj.id }, obj, {}, function (err, numReplaced) {
        console.log(err);
      });
    }
  });

};
