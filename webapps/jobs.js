/*jshint esversion: 6 */
var Datastore = require('nedb');
var db = new Datastore({ filename: 'tmp/users.db', autoload: true });

exports.add_or_update = function(obj) {
  db.find({ id: obj.id }, function (err, docs) {
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

exports.get_friend_stranger_locations = function(uid, callback){
  let data = {};
  let all_locations = {};
  db.find({id: uid}, function(err, docs) {
    data.visited_places = [];
    for(let i=0; i<docs[0].places.data.length; i++){
      data.visited_places.push(docs[0].places.data[i].place.location);
    }
    data.friends = [];
    for(let i=0; i<docs[0].friends.data.length; i++){
      let friend = {};
      let fname = docs[0].friends.data[i].name;
      friend[fname] = [];
      let f_id = docs[0].friends.data[i].id;
      db.find({id: f_id}, function(ferr, fdocs) {
        for (let j=0; j<fdocs[0].places.data.length; j++) {
          friend[fname].push(fdocs[0].places.data[j].place.location);
        }
      });
      data.friends.push(friend);
    }
    db.find({}, function(err, docs) {
      data.people = [];
      for (let i=0; i<docs.length; i++){
        let person = {};
        let pname = docs[i].name;
        person[pname] = [];
        for(let j=0; j<(docs[i].places.data ? docs[i].places.data.length : 0); j++){
          person[pname].push(docs[i].places.data[j].place.location);
          if (docs[i].places.data[j].place.location && docs[i].places.data[j].place.location.city) {
            all_locations[docs[i].places.data[j].place.location.city] = 0.4;
          }
        }
        if (docs[i].places.data) {
          data.people.push(person);
          data.sentiments = all_locations;
        }
      }
      console.log(data)
      callback(data);
    });
  });
};
