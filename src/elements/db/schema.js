function Schema(name) {
  return this.importSchema(lf.schema.create(name, 1));
}

Schema.prototype.importSchema = function importSchema(schemaBuilder) {
  // agency
    
  // calendar
  schemaBuilder.createTable('calendar').
    addColumn('id', lf.Type.INTEGER).
    addColumn('service_id', lf.Type.STRING).
    addColumn('monday', lf.Type.INTEGER).
    addColumn('tuesday', lf.Type.INTEGER).
    addColumn('wednesday', lf.Type.INTEGER).
    addColumn('thursday', lf.Type.INTEGER).
    addColumn('friday', lf.Type.INTEGER).
    addColumn('saturday', lf.Type.INTEGER).
    addColumn('sunday', lf.Type.INTEGER).
    addColumn('start_date', lf.Type.INTEGER).
    addColumn('end_date', lf.Type.INTEGER).
    addPrimaryKey(['service_id']);
  
  // calendar_dates
  schemaBuilder.createTable('calendar_dates').
    addColumn('id', lf.Type.INTEGER).
    addColumn('service_id', lf.Type.STRING).
    addColumn('date', lf.Type.INTEGER).
    addColumn('exception_type', lf.Type.INTEGER).
    addPrimaryKey(['service_id']);
  
  // fare_attributes
  
  // fare_rules
  
  // routes
  schemaBuilder.createTable('routes').
    addColumn('id', lf.Type.INTEGER).
    addColumn('route_id', lf.Type.STRING).
    addColumn('route_short_name', lf.Type.STRING).
    addColumn('route_long_name', lf.Type.STRING).
    addColumn('route_type', lf.Type.INTEGER).
    addColumn('route_color', lf.Type.STRING).
    addPrimaryKey(['route_id']);
  
  // stop_times
  schemaBuilder.createTable('stop_times').
    addColumn('id', lf.Type.INTEGER).
    addColumn('trip_id', lf.Type.STRING).
    addColumn('arrival_time', lf.Type.STRING).
    addColumn('departure_time', lf.Type.STRING).
    addColumn('stop_id', lf.Type.INTEGER).
    addColumn('stop_sequence', lf.Type.INTEGER).
    addColumn('pickup_type', lf.Type.INTEGER).
    addColumn('drop_off_type', lf.Type.INTEGER).
    addPrimaryKey(['stop_id', 'trip_id']);

  // stops
  schemaBuilder.createTable('stops').
    addColumn('id', lf.Type.INTEGER).
    addColumn('stop_id', lf.Type.INTEGER).
    addColumn('stop_code', lf.Type.INTEGER).
    addColumn('stop_name', lf.Type.STRING).
    addColumn('stop_lat', lf.Type.INTEGER).
    addColumn('stop_lon', lf.Type.INTEGER).
    addColumn('zone_id', lf.Type.INTEGER).
    addColumn('stop_url', lf.Type.STRING).
    addColumn('location_type', lf.Type.INTEGER).
    addColumn('parent_station', lf.Type.STRING).
    addColumn('platform_code', lf.Type.STRING).
    addColumn('wheelchair_boarding', lf.Type.INTEGER).
    addPrimaryKey(['stop_id']);
  
  // trips
  schemaBuilder.createTable('trips').
    addColumn('id', lf.Type.INTEGER).
    addColumn('route_id', lf.Type.STRING).
    addColumn('service_id', lf.Type.STRING).
    addColumn('trip_id', lf.Type.STRING).
    addColumn('trip_headsign', lf.Type.STRING).
    addColumn('trip_short_name', lf.Type.STRING).
    addColumn('direction_id', lf.Type.INTEGER).
    addColumn('shape_id', lf.Type.STRING).
    addColumn('wheelchair_accessible', lf.Type.INTEGER).
    addColumn('bikes_allowed', lf.Type.INTEGER).
    addPrimaryKey(['trip_id']);
  
  return schemaBuilder;
};