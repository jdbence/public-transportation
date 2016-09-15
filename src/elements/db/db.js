function DB(name, tables) {
  this.name = name;
  this.tables = tables;
  this.db = null;
  this.schema = new Schema(this.name);
}
  
DB.prototype.connect = function() {
  return this.schema.connect()
    .then(function(database) {
      this.db = database;
    }.bind(this))
    // reload only if required
    .then(this.hasTableData.bind(this))
    .then(function(exists){
      console.log("DB Cached:", exists);
      return !exists ? Promise.resolve() : Promise.reject();
    }.bind(this))
    .then(this.importData.bind(this))
    .catch(function(){
      return;
    });
};

DB.prototype.tablePromises = function(tables) {
  var promises = [];
  for(var i = 0; i < tables.length; i++) {
    promises.push(this.importCSV('static/' + this.name + '/' + tables[i] + '.txt', tables[i]));
  }
  return promises;
};

DB.prototype.importCSV = function(url, name) {
  var table = this.db.getSchema().table(name);
  return this.loadFile(url)
    .then(function(str) {
      var rows = [];
      var lines = str.split('\n');
      // has columns and data
      if(lines.length >= 1) {
        var headers = lines[0].split(',');
        for(var i = 1; i < lines.length; i++) {
          var data = lines[i].split(',');
          // line has data
          if(data.length > 0){
            var obj = {id: i - 1};
            for(var j = 0; j < data.length; j++) {
               obj[headers[j].trim()] = this.nonNull(data[j].trim());
            }
            rows.push(table.createRow(obj));
          }
        }
        if(rows.length > 0) {
          this.db
            .insertOrReplace()
            .into(table)
            .values(rows).exec();
        }
      }
    }.bind(this));
};

DB.prototype.nonNull = function(value) {
  return value ? value : "";
};

DB.prototype.loadFile = function(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject();
      }
    };
    xhr.onerror = reject;
    xhr.send();
  });
};

DB.prototype.importData = function() {
  return Promise.all(this.tablePromises(this.tables));
};

DB.prototype.hasTableData = function() {
  var table = this.db.getSchema().table('stops');
  return this.db.select(lf.fn.count(table.id))
    .from(table)
    .exec()
    .then(function(results){
      return results[0]['COUNT(id)'] > 0;
    });
};

DB.prototype.service = function(day) {
  var calendar = this.db.getSchema().table('calendar');
  return this.db.select()
    .from(calendar)
    .where(calendar.id.eq(day))
    .exec();
};

DB.prototype.departTrips = function(serviceID, station, time) {
  var stops = this.db.getSchema().table('stops');
  var stopTimes = this.db.getSchema().table('stop_times');
  var trips = this.db.getSchema().table('trips');
  var composite = lf.op.and.apply(null, [
    stopTimes.trip_id.eq(trips.trip_id),
    stopTimes.stop_id.eq(stops.stop_id),
    stops.stop_name.eq(station),
    stopTimes.departure_time.gt(time),
    trips.service_id.eq(serviceID)
  ]);
  return this.db
    .select(stopTimes.trip_id.as('trip_id'), stopTimes.departure_time.as('departure_time'), stops.stop_name.as('stop_name'))
    .from(stopTimes, trips, stops)
    .limit(20)
    .where(
      composite
    )
    .orderBy(stopTimes.trip_id)
    .orderBy(stopTimes.departure_time)
    .exec();
};

DB.prototype.arriveTrips = function(trip_ids, serviceID, station, time) {
  var stops = this.db.getSchema().table('stops');
  var stopTimes = this.db.getSchema().table('stop_times');
  var trips = this.db.getSchema().table('trips');
  var composite = lf.op.and.apply(null, [
    stopTimes.trip_id.eq(trips.trip_id),
    stopTimes.stop_id.eq(stops.stop_id),
    stopTimes.trip_id.in(trip_ids),
    stops.stop_name.eq(station),
    stopTimes.departure_time.gt(time),
    trips.service_id.eq(serviceID)
  ]);
  return this.db
    .select(stopTimes.trip_id.as('trip_id'), stopTimes.departure_time.as('departure_time'))
    .from(stopTimes, trips, stops)
    .where(
      composite
    )
    .orderBy(stopTimes.trip_id)
    .orderBy(stopTimes.departure_time)
    .exec();
};

DB.prototype.tripInfo = function(trip_ids, serviceID, depart, arrive, time) {
  var stops = this.db.getSchema().table('stops');
  var stopTimes = this.db.getSchema().table('stop_times');
  var trips = this.db.getSchema().table('trips');
  var composite = lf.op.and.apply(null, [
    stopTimes.trip_id.eq(trips.trip_id),
    stopTimes.stop_id.eq(stops.stop_id),
    stops.stop_name.in([depart, arrive]),
    stopTimes.trip_id.in(trip_ids),
    trips.service_id.eq(serviceID)
  ]);
  return this.db
    .select(stopTimes.trip_id.as('trip_id'), stopTimes.stop_id.as('stop_id'),
      stopTimes.departure_time.as('departure_time'), stopTimes.arrival_time.as('arrival_time'), stops.stop_name.as('stop_name'))
    .from(stopTimes, trips, stops)
    .where(
      composite
    )
    .orderBy(stopTimes.trip_id)
    .orderBy(stopTimes.departure_time)
    .exec();
};

DB.prototype.stations = function() {
  var stops = this.db.getSchema().table('stops');
  return this.db
    .select(stops.stop_name, stops.stop_lat, stops.stop_lon)
    .from(stops)
    .orderBy(stops.stop_name)
    .groupBy(stops.stop_name)
    .exec();
};

DB.prototype.findRoutes = function(depart, arrive, time, day) {
  var dayIndex = day === "Weekday" ? 0 : (day === "Saturday" ? 1 : 2);
  var serviceID;
  var departIDs;
  var filteredIDs;
  
  // Return none if matching stations
  if(depart === arrive || this.db == null){
    return new Promise(function(resolve, reject) {
      resolve([]);
    });
  }
  
  // Get day service
  return this.service(dayIndex)
   // Get depart stations
   .then(function(results) {
    if(results.length > 0){
      serviceID = results[0].service_id;
      return this.departTrips(serviceID, depart, time);
    }
    return Promise.reject();
   }.bind(this))
   // Filter arrive stations
   .then(function(results) {
     departIDs = results.map(function(item) {
       return item.trip_id;
     });
     return this.arriveTrips(departIDs, serviceID, arrive, time);
   }.bind(this))
   // Get trip information
   .then(function(results) {
     filteredIDs = results.map(function(item) {
       return item.trip_id;
     });
     return this.tripInfo(filteredIDs, serviceID, depart, arrive, time);
   }.bind(this))
   // Filter out arrive -> depart trips
   .then(function(results) {
     var trips = [];
     for(var i = 0; i < results.length; i+=2){
       if(results[i].stop_name === depart){
         trips.push({
           trip_id: results[i].trip_id,
           depart: depart,
           arrive: arrive,
           departure_time: results[i].departure_time,
           arrival_time: results[i+1].arrival_time
         });
       }
     }
     return trips;
   })
   .catch(function(){
     return [];
   });
};
