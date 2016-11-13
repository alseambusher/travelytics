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
      if (docs[0].places.data[i].place.location && docs[0].places.data[i].place.location.city)
        data.visited_places.push(docs[0].places.data[i].place.location);
    }
    data.friends = {};
    for(let i=0; i<docs[0].friends.data.length; i++){
      let friend = {};
      let fname = docs[0].friends.data[i].name;
      friend[fname] = [];
      let f_id = docs[0].friends.data[i].id;
      db.find({id: f_id}, function(ferr, fdocs) {
        for (let j=0; j<fdocs[0].places.data.length; j++) {
          if (fdocs[0].places.data[j].place.location && fdocs[0].places.data[j].place.location.city)
            friend[fname].push(fdocs[0].places.data[j].place.location);
        }
      });
      if (friend[fname])
        data.friends[fname] = friend[fname];
    }
    db.find({}, function(err, docs) {
      data.people = {};
      for (let i=0; i<docs.length; i++){
        let person = {};
        let pname = docs[i].name;
        let pid = docs[i].id;
        person[pname] = [];
        for(let j=0; j<(docs[i].places.data ? docs[i].places.data.length : 0); j++){
          if (docs[i].places.data[j].place.location && docs[i].places.data[j].place.location.city) {
            person[pname].push(docs[i].places.data[j].place.location);
            all_locations[docs[i].places.data[j].place.location.city] = 0.4;
          }
        }
        if (docs[i].places.data) {
          if (uid != pid)
            data.people[pname] = person[pname];
          data.sentiments = all_locations;
        }
      }
      callback(data);
    });
  });
};
