class DB {
  constructor(name) {
    this.name = name;
    this.schema = {};
    this.addSchemas();
  }
  
  connect() {
    return this.importData();
  }
  
  importData() {
    return Promise.all([
      this.importCSV(this.name + '/calendar.txt', 'calendar'),
      this.importCSV(this.name + '/calendar_dates.txt', 'calendar_dates'),
      this.importCSV(this.name + '/routes.txt', 'routes'),
      this.importCSV(this.name + '/stop_times.txt', 'stop_times'),
      this.importCSV(this.name + '/stops.txt', 'stops'),
      this.importCSV(this.name + '/trips.txt', 'trips')
    ]);
  }
  
  addSchemas() {
    // agency
    
    // calendar
    this.defineSchema('calendar', ['service_id','monday','tuesday','wednesday',
      'thursday','friday','saturday','sunday','start_date','end_date']);
    
    // calendar_dates
    this.defineSchema('calendar_dates', ['service_id','date','exception_type']);
    
    // fare_attributes
    
    // fare_rules
    
    // routes
    this.defineSchema('routes', ['route_id','route_short_name','route_long_name','route_type','route_color']);
    
    // stop_times
    this.defineSchema('stop_times', ['trip_id','arrival_time','departure_time',
      'stop_id','stop_sequence','pickup_type','drop_off_type']);

    // stops
    this.defineSchema('stops', ['stop_id','stop_code','stop_name','stop_lat',
      'stop_lon','zone_id','stop_url','location_type','parent_station','platform_code','wheelchair_boarding']);
    
    // trips
    this.defineSchema('trips', ['route_id','service_id','trip_id','trip_headsign',
      'trip_short_name','direction_id','shape_id','wheelchair_accessible','bikes_allowed']);
  }
  
  defineSchema(name, props) {
    this.schema[name] = persistence.define(name, this.textProps(props));
  }
  
  textProps(keys) {
    var def = {};
    keys.forEach(function(item){
      def[item] = 'TEXT';
    });
    return def;
  }
  
  importCSV(url, name) {
    return this.loadFile(url, name)
      .then((str) => {
        var rows = str.split('\n');
        var headers = rows[0].split(',');
        for(var i = 1; i < rows.length; i++) {
          var data = rows[i].split(',');
          var obj = {};
          for(var j = 0; j < data.length; j++) {
             obj[headers[j].trim()] = data[j].trim();
          }
          persistence.add(new this.schema[name](obj));
        }
      });
  }
  
  loadFile(url, name) {
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
  }
  
  findRoutes(depart, arrive, day) {
    return new Promise(function(resolve, reject) {
      resolve([
        [
          {name: 'Belmont', train:"#49", start:'8:00', end:'8:15', duration:'15'},
          {name: 'Palo Alto', train:"#50", start:'8:15', end:'8:30', duration:'15'}
        ],
        [
          {name: 'Belmont', train:"#49", start:'9:00', end:'9:30', duration:'30'}
        ]
      ]);
    });
  }
}